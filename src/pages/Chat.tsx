import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Send, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FinancialPlan, Goal } from "@/contexts/FinancialDataContext";
import { ChatAPI, type ChatMessage } from "@/api/chat";
import { useNessie } from "@/hooks/use-nessie";
import { useAIContext } from "@/hooks/useAIContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";

type ConversationMessage = ChatMessage & { id: string };

type PlanUpdateInstruction = {
  updates: Partial<FinancialPlan>;
  reason?: string;
};

type GoalInstruction = {
  name: string;
  amount: number;
  monthsToComplete?: number;
  targetDate?: string;
  monthlyAllocation?: number;
  reason?: string;
};

const PLAN_UPDATE_TAG = /<planUpdate>([\s\S]*?)<\/planUpdate>/gi;
const CREATE_GOAL_TAG = /<createGoal>([\s\S]*?)<\/createGoal>/gi;
const CHAT_STORAGE_KEY = "moneytalks_chat_messages_v1";
const MAX_STORED_MESSAGES = 200;

const PLAN_UPDATE_TEMPLATE = `
Only when the user clearly asks you to adjust their financial plan (or you have confirmed they want a change), emit a tag like:
<planUpdate>{
  "updates": {
    "savingsPercentage": 30,
    "investmentsPercentage": 20,
    "livingExpensesPercentage": 50,
    "monthlyIncome": 8400
  },
  "reason": "explain why you did it"
}</planUpdate>
Skip the tag entirely if the user is only asking for information, a recap, or advice. Only include the fields that truly need to change. Percentages must roughly sum to 100. Monthly/yearly income should be consistent.
`;

const CREATE_GOAL_TEMPLATE = `
Only when the user explicitly requests a new goal or approves a change, emit:
<createGoal>{
  "name": "Emergency Fund",
  "amount": 8000,
  "monthsToComplete": 4,
  "monthlyAllocation": 2000,
  "reason": "explain why"
}</createGoal>
You can return an array inside the tag to create multiple goals at once. If you omit months or monthlyAllocation, the client will calculate them. Do not emit this tag if the user did not ask for goal changes.
`;
const PLAN_UPDATE_KEYS: Array<keyof FinancialPlan> = [
  "savingsPercentage",
  "investmentsPercentage",
  "livingExpensesPercentage",
  "monthlyIncome",
  "yearlyIncome",
];

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,%\s]/g, "");
    if (!cleaned) return undefined;
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const createAssistantGreeting = (): ConversationMessage => ({
  id: crypto.randomUUID(),
  role: "assistant",
  content: "Hi Alex! I'm your MoneyTalks advisor. How can I help you with your finances today?",
});

const getDefaultConversation = () => [createAssistantGreeting()];

const sanitizeStoredMessages = (input: unknown): ConversationMessage[] | null => {
  if (!Array.isArray(input)) return null;

  const sanitized: ConversationMessage[] = [];

  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const maybeMessage = item as Record<string, unknown>;
    const role = maybeMessage.role;
    const content = maybeMessage.content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      sanitized.push({
        id: typeof maybeMessage.id === "string" ? maybeMessage.id : crypto.randomUUID(),
        role,
        content,
      });
    }
  }

  if (sanitized.length === 0) {
    return null;
  }

  return sanitized.slice(-MAX_STORED_MESSAGES);
};

const loadStoredConversation = (): ConversationMessage[] => {
  if (typeof window === "undefined") {
    return getDefaultConversation();
  }

  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return getDefaultConversation();
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeStoredMessages(parsed);
    if (sanitized && sanitized.length > 0) {
      return sanitized;
    }
  } catch (storageError) {
    console.warn("[chat] Failed to load stored conversation", storageError);
  }

  return getDefaultConversation();
};

const extractAutomationInstructions = (raw: string) => {
  const planUpdates: PlanUpdateInstruction[] = [];
  const goalInstructions: GoalInstruction[] = [];

  let cleaned = raw;

  cleaned = cleaned.replace(PLAN_UPDATE_TAG, (match, payload) => {
    try {
      const parsed = JSON.parse(String(payload).trim());
      const source = parsed.updates ?? parsed.plan ?? parsed;
      const updates: Partial<FinancialPlan> = {};

      PLAN_UPDATE_KEYS.forEach((key) => {
        const value = toNumber((source as Record<string, unknown>)[key]);
        if (value !== undefined) {
          updates[key] = value;
        }
      });

      if (Object.keys(updates).length > 0) {
        planUpdates.push({
          updates,
          reason:
            typeof parsed.reason === "string"
              ? parsed.reason
              : typeof parsed.explanation === "string"
                ? parsed.explanation
                : typeof parsed.note === "string"
                  ? parsed.note
                  : undefined,
        });
      }
      return "";
    } catch (error) {
      console.warn("[chat] Failed to parse <planUpdate> payload", error);
      return match;
    }
  });

  cleaned = cleaned.replace(CREATE_GOAL_TAG, (match, payload) => {
    try {
      const parsed = JSON.parse(String(payload).trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];

      items.forEach((item) => {
        if (!item || typeof item !== "object") return;
        const name = typeof (item as Record<string, unknown>).name === "string" ? (item as Record<string, unknown>).name.trim() : "";
        const amount = toNumber((item as Record<string, unknown>).amount);

        if (!name || amount === undefined) return;

        const goalInstruction: GoalInstruction = {
          name,
          amount,
        };

        const months = toNumber((item as Record<string, unknown>).monthsToComplete);
        if (months !== undefined) {
          goalInstruction.monthsToComplete = Math.max(1, Math.round(months));
        }

        if (typeof (item as Record<string, unknown>).targetDate === "string") {
          goalInstruction.targetDate = (item as Record<string, unknown>).targetDate;
        }

        const monthlyAllocation = toNumber((item as Record<string, unknown>).monthlyAllocation);
        if (monthlyAllocation !== undefined) {
          goalInstruction.monthlyAllocation = Math.max(1, Math.round(monthlyAllocation));
        }

        if (typeof (item as Record<string, unknown>).reason === "string") {
          goalInstruction.reason = (item as Record<string, unknown>).reason;
        }

        goalInstructions.push(goalInstruction);
      });

      return "";
    } catch (error) {
      console.warn("[chat] Failed to parse <createGoal> payload", error);
      return match;
    }
  });

  return {
    cleaned: cleaned.trim(),
    planUpdates,
    goals: goalInstructions,
  };
};

const persistMessages = (messages: ConversationMessage[]) => {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-MAX_STORED_MESSAGES).map(({ id, role, content }) => ({ id, role, content }));
    window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (storageError) {
    console.warn("[chat] Failed to persist conversation", storageError);
  }
};

export default function Chat() {
  const [messages, setMessages] = useState<ConversationMessage[]>(() => loadStoredConversation());
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { run, loading, error } = useNessie();
  const [displayError, setDisplayError] = useState<string | null>(null);

  const { getAIPromptContext, getGoalsSummary, getPercentages, getIncome, getNinetyDaySnapshot } = useAIContext();
  const { adjustFinancialPlan, addGoal } = useFinancialData();

  const aiSummary = useMemo(() => getAIPromptContext(), [getAIPromptContext]);
  const goalsSnapshot = useMemo(() => getGoalsSummary(), [getGoalsSummary]);
  const percentageSnapshot = useMemo(() => getPercentages(), [getPercentages]);
  const incomeSnapshot = useMemo(() => getIncome(), [getIncome]);
  const ninetyDaySnapshot = useMemo(() => getNinetyDaySnapshot(), [getNinetyDaySnapshot]);

  const systemPrompt = useMemo(() => {
    const corePrompt = `You are MoneyTalks, a helpful personal finance AI that gives concise, actionable advice.
Answer using clear paragraphs, cite figures in USD, and reference spending trends only if mentioned.
You have the ability to adjust the user's financial plan and goals via special XML tags (documented below).
Always provide the user-facing explanation outside of the tags.
`;

    return `${corePrompt}
${PLAN_UPDATE_TEMPLATE}
${CREATE_GOAL_TEMPLATE}`;
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading, displayError]);

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (error) {
      setDisplayError(`Sorry, I couldn't reach the AI advisor. ${error}`);
    } else {
      setDisplayError(null);
    }
  }, [error]);

  const describePlanChange = useCallback(
    (plan: FinancialPlan, prefix?: string, snapshot?: ReturnType<typeof getNinetyDaySnapshot>) => {
      const savingsMonthly = Math.round((plan.monthlyIncome * plan.savingsPercentage) / 100);
      const investmentsMonthly = Math.round((plan.monthlyIncome * plan.investmentsPercentage) / 100);
      const livingMonthly = Math.round((plan.monthlyIncome * plan.livingExpensesPercentage) / 100);

      const planSnapshot = snapshot ?? getNinetyDaySnapshot();
      const monthRecap = planSnapshot
        ? `90-day totals: $${planSnapshot.totals.totalSavings.toLocaleString()} savings, $${planSnapshot.totals.totalInvestments.toLocaleString()} investments, $${planSnapshot.totals.totalLivingExpenses.toLocaleString()} living, $${planSnapshot.totals.totalGoals.toLocaleString()} goals.`
        : "90-day plan was generated to match.";

      const goalAllocations = goalsSnapshot
        .map((goal) => ({
          name: goal.name,
          amount: goal.target,
          monthly: goal.monthlyAllocation,
          monthsLeft: Math.max(1, Math.ceil((goal.target - goal.progress) / Math.max(goal.monthlyAllocation, 1))),
        }))
        .map(
          (goal) =>
            `• ${goal.name}: target $${goal.amount.toLocaleString()}, allocating $${goal.monthly.toLocaleString()}/month (~${goal.monthsLeft} months remaining)`,
        )
        .join("\n");

      const lines = [
        prefix ? `${prefix.trim()}\n` : "",
        "Here's the updated breakdown:",
        `• Monthly income: $${plan.monthlyIncome.toLocaleString()} (Annual: $${plan.yearlyIncome.toLocaleString()})`,
        `• Savings: ${plan.savingsPercentage}% ($${savingsMonthly.toLocaleString()}/month)`,
        `• Investments: ${plan.investmentsPercentage}% ($${investmentsMonthly.toLocaleString()}/month)`,
        `• Living expenses: ${plan.livingExpensesPercentage}% ($${livingMonthly.toLocaleString()}/month)`,
        monthRecap,
        goalAllocations ? `Goal allocations:
${goalAllocations}` : "",
        "Your Plan tab now reflects this change.",
      ].filter(Boolean);

      return lines.join("\n");
    },
    [getNinetyDaySnapshot, goalsSnapshot],
  );

  const createGoal = useCallback(
    (
      name: string,
      amount: number,
      monthsToComplete: number = 6,
      monthlyAllocation?: number,
      targetDate?: string,
      reason?: string,
    ) => {
      const normalizedMonths = Math.max(1, Math.round(monthsToComplete)) || 6;
      const allocation = monthlyAllocation ?? Math.max(25, Math.ceil(amount / normalizedMonths));
      const finalTargetDate = targetDate
        ? new Date(targetDate)
        : (() => {
            const date = new Date();
            date.setMonth(date.getMonth() + normalizedMonths);
            return date;
          })();

      const newGoal: Goal = {
        id: crypto.randomUUID(),
        name,
        amount: Math.round(amount),
        targetDate: finalTargetDate.toISOString(),
        monthlyAllocation: Math.round(allocation),
        currentAmount: 0,
      };

      addGoal(newGoal);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
      role: "assistant",
          content: `I've added a new goal "${name}" for $${newGoal.amount.toLocaleString()}. We'll allocate $${newGoal.monthlyAllocation.toLocaleString()} each month and aim to reach it by ${finalTargetDate.toLocaleDateString()}.${
            reason ? ` ${reason}` : ""
          } Check the Plan tab for the updated timeline.`,
        },
      ]);
    },
    [addGoal],
  );

  const handlePlanAdjustmentResponse = useCallback(
    (plan: FinancialPlan, reason?: string) => {
      const snapshot = getNinetyDaySnapshot();
      const prefix = reason
        ? `${reason} Here's what I updated:`
        : "I balanced your plan based on that request. Here's the current breakdown:";

      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: describePlanChange(plan, prefix, snapshot ?? undefined),
          },
        ];
        persistMessages(next);
        return next;
      });
    },
    [describePlanChange, getNinetyDaySnapshot],
  );

  const handleAdjustPlan = useCallback(
    (updates: Partial<FinancialPlan>, reason?: string) => {
      const updated = adjustFinancialPlan(updates);
      handlePlanAdjustmentResponse(updated, reason);
    },
    [adjustFinancialPlan, handlePlanAdjustmentResponse],
  );

  const handleLocalCommand = useCallback(
    (raw: string) => {
      const text = raw.toLowerCase();

      const emergencyMatch = text.match(
        /add\s+(?:an?\s+)?(?:emergency\s+fund|emergency\s+fund\s+goal)(?:\s+of|\s+for)?\s*\$?([\d,.]+)\s*(k)?/,
      );

      if (emergencyMatch) {
        const [, amountRaw, isK] = emergencyMatch;
        let amount = Number.parseFloat(amountRaw.replace(/,/g, ""));
        if (!Number.isNaN(amount) && amount > 0) {
          if (isK) amount *= 1000;
          createGoal("Emergency Fund", amount, 4);
          return true;
        }
      }

      const percentMatch = text.match(
        /(set|change|adjust|update|increase|decrease)\s+(savings|investment|investments|living|living expenses)\s*(?:allocation|budget)?\s*(?:to|at|by)?\s*(\d{1,3})\s*%?/,
      );

      if (percentMatch) {
        const [, verb, categoryRaw, valueRaw] = percentMatch;
        const category = categoryRaw.toLowerCase();
        let target = Math.min(100, Math.max(0, Number.parseInt(valueRaw, 10)));
        if (Number.isNaN(target)) {
          target = 0;
        }

        const updates: Partial<FinancialPlan> = {};
        if (category.startsWith("saving")) updates.savingsPercentage = target;
        else if (category.startsWith("invest")) updates.investmentsPercentage = target;
        else updates.livingExpensesPercentage = target;

        handleAdjustPlan(updates, `I've ${verb}d your ${category} allocation to ${target}%.`);
        return true;
      }

      const incomeMatch = text.match(
        /(set|change|adjust|update)\s+(monthly|annual|yearly)\s+(income|budget)\s*(?:to|at)?\s*\$?([\d,]+)/,
      );

      if (incomeMatch) {
        const [, verb, cadence, , valueRaw] = incomeMatch;
        const amount = Number.parseFloat(valueRaw.replace(/,/g, ""));
        if (!Number.isNaN(amount) && amount > 0) {
          if (cadence === "monthly") {
            handleAdjustPlan(
              {
                monthlyIncome: Math.round(amount),
                yearlyIncome: Math.round(amount * 12),
              },
              `I've ${verb}d your monthly income to $${Math.round(amount).toLocaleString()}.`,
            );
          } else {
            handleAdjustPlan(
              {
                yearlyIncome: Math.round(amount),
                monthlyIncome: Math.round(amount / 12),
              },
              `I've ${verb}d your annual income to $${Math.round(amount).toLocaleString()}.`,
            );
          }
          return true;
        }
      }

      return false;
    },
    [handleAdjustPlan, createGoal],
  );

  const handleIntegrationResponse = useCallback(
    (raw: string) => {
      const { cleaned, planUpdates, goals } = extractAutomationInstructions(raw);

      planUpdates.forEach(({ updates, reason }) => {
        handleAdjustPlan(updates, reason);
      });

      goals.forEach((instruction) => {
        createGoal(
          instruction.name,
          instruction.amount,
          instruction.monthsToComplete,
          instruction.monthlyAllocation,
          instruction.targetDate,
          instruction.reason,
        );
      });

      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: cleaned,
          },
        ];
        persistMessages(next);
        return next;
      });

      return cleaned;
    },
    [handleAdjustPlan, createGoal],
  );

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (handleLocalCommand(trimmed)) {
      setInput("");
      return;
    }

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setDisplayError(null);

    const payloadMessages: ChatMessage[] = [...messages, userMessage].map(({ role, content }) => ({ role, content }));

    const response = await run(() =>
      ChatAPI.complete({
        messages: payloadMessages,
        context: {
          goals: goalsSnapshot
            .map(
              (goal) =>
                `${goal.name}: $${goal.target.toLocaleString()} target with $${goal.monthlyAllocation.toLocaleString()}/month (due ${new Date(goal.targetDate).toLocaleDateString()})`,
            )
            .join("\n"),
          accountSummary: `Income: $${incomeSnapshot.monthly.toLocaleString()} / month ($${incomeSnapshot.yearly.toLocaleString()} / year)\n` +
            `Savings: ${percentageSnapshot.savings}%\nInvestments: ${percentageSnapshot.investments}%\nLiving Expenses: ${percentageSnapshot.living}%`,
          summary: aiSummary,
          planSnapshot: ninetyDaySnapshot
            ? {
                createdDate: ninetyDaySnapshot.createdDate,
                totals: ninetyDaySnapshot.totals,
                months: ninetyDaySnapshot.months,
              }
            : undefined,
        },
        systemPrompt,
      }),
    );
    if (!response?.message) {
      setDisplayError("Sorry, I couldn't get a response from the AI advisor.");
      return;
    }

    const reply = response.message.trim();
    if (!reply) {
      setDisplayError("Sorry, the AI advisor sent an empty reply.");
      return;
    }

    handleIntegrationResponse(reply);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Header title="Chat Advisor" subtitle="Ask me anything about your finances" />

      <GlassCard className="flex-1 flex flex-col mb-6 overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/30 text-foreground"
                    : "bg-white/5 border border-white/10 text-foreground"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold">
                      MT
                    </div>
                    <span className="text-xs text-muted-foreground">AI Advisor</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                {message.role === "assistant" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleAdjustPlan({
                          savingsPercentage: percentageSnapshot.savings + 5,
                        })
                      }
                    >
                      Increase Savings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleAdjustPlan({
                          investmentsPercentage: percentageSnapshot.investments + 5,
                        })
                      }
                    >
                      Boost Investments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleAdjustPlan({
                          livingExpensesPercentage: percentageSnapshot.living + 5,
                        })
                      }
                    >
                      Increase Living Budget
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold">
                    MT
                  </div>
                  <span className="text-xs text-muted-foreground">AI Advisor</span>
                </div>
                <p className="text-sm leading-relaxed">Thinking...</p>
              </div>
            </div>
          )}
          {displayError && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-destructive/20 border border-destructive/30 text-destructive">
                <p className="text-sm leading-relaxed">{displayError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="glass-card-hover shrink-0" disabled={loading}>
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your spending, savings, or goals..."
            className="flex-1 glass-card border-white/10 focus:border-primary/50"
            disabled={loading}
          />
          <Button onClick={handleSend} className="gradient-primary shrink-0 hover:opacity-90" disabled={loading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
