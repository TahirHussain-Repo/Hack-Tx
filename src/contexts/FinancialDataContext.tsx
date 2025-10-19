import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
export interface Goal {
  id: string;
  name: string;
  amount: number;
  targetDate: string;
  monthlyAllocation: number;
  currentAmount?: number;
  emoji?: string;
}

export interface Account {
  _id: string;
  type: string;
  nickname: string;
  balance: number;
  rewards: number;
  account_number?: string;
}

export interface Bill {
  _id?: string;
  payee: string;
  payment_amount: number;
  status: string;
  payment_date?: string;
  recurring_date?: number;
}

export interface Transaction {
  _id: string;
  type: string;
  amount: number;
  transaction_date: string;
  description?: string;
  merchant?: string;
  category?: string;
}

export interface FinancialPlan {
  savingsPercentage: number;
  investmentsPercentage: number;
  livingExpensesPercentage: number;
  monthlyIncome: number;
  yearlyIncome: number;
}

export interface NinetyDayPlan {
  createdDate: string;
  months: Array<{
    month: number;
    monthName: string;
    totalIncome: number;
    paychecks: Array<{
      paycheckNumber: number;
      date: string;
      income: number;
      savings: number;
      investments: number;
      livingExpenses: number;
      goalAllocations: Array<{ goalId: string; goalName: string; amount: number }>;
    }>;
    monthTotals: {
      income: number;
      savings: number;
      investments: number;
      livingExpenses: number;
      goals: number;
    };
  }>;
  overallTotals: {
    totalIncome: number;
    totalSavings: number;
    totalInvestments: number;
    totalLivingExpenses: number;
    totalGoals: number;
  };
}

interface FinancialData {
  goals: Goal[];
  accounts: Account[];
  bills: Bill[];
  transactions: Transaction[];
  financialPlan: FinancialPlan | null;
  ninetyDayPlan: NinetyDayPlan | null;
  lastUpdated: string | null;
}

interface FinancialDataContextType {
  data: FinancialData;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setAccounts: (accounts: Account[]) => void;
  setBills: (bills: Bill[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setFinancialPlan: (plan: FinancialPlan) => void;
  setNinetyDayPlan: (plan: NinetyDayPlan) => void;
  adjustFinancialPlan: (updates: Partial<FinancialPlan>) => FinancialPlan;
  updateData: (updates: Partial<FinancialData>) => void;
  clearAllData: () => void;
  getFinancialSummary: () => string;
}

const defaultData: FinancialData = {
  goals: [],
  accounts: [],
  bills: [],
  transactions: [],
  financialPlan: null,
  ninetyDayPlan: null,
  lastUpdated: null,
};

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const cloneGoalAllocations = (
  allocations: NinetyDayPlan["months"][number]["paychecks"][number]["goalAllocations"],
): NinetyDayPlan["months"][number]["paychecks"][number]["goalAllocations"] =>
  allocations.map((allocation) => ({ ...allocation }));

const buildNinetyDayPlan = (plan: FinancialPlan, goals: Goal[]): NinetyDayPlan => {
  const perPaycheck = plan.monthlyIncome / 2;
  const savingsPerPaycheck = Math.round((perPaycheck * plan.savingsPercentage) / 100);
  const investmentsPerPaycheck = Math.round((perPaycheck * plan.investmentsPercentage) / 100);
  const livingExpensesPerPaycheck = Math.round((perPaycheck * plan.livingExpensesPercentage) / 100);

  const goalTotalsPerMonth = goals.reduce((sum, goal) => sum + goal.monthlyAllocation, 0);
  const goalAllocationsPerPaycheck = goals.map((goal) => ({
    goalId: goal.id,
    goalName: goal.name,
    amount: Math.round(goal.monthlyAllocation / 2),
  }));

  const today = new Date();
  let overallSavings = 0;
  let overallInvestments = 0;
  let overallLivingExpenses = 0;
  let overallGoals = 0;

  const months: NinetyDayPlan["months"] = Array.from({ length: 3 }, (_, monthIdx) => {
    const monthDate = new Date(today);
    monthDate.setMonth(today.getMonth() + monthIdx);

    const paychecks: NinetyDayPlan["months"][number]["paychecks"] = [0, 1].map((paycheckIdx) => {
      const paycheckDate = new Date(monthDate);
      paycheckDate.setDate(paycheckIdx === 0 ? 1 : 15);

      overallSavings += savingsPerPaycheck;
      overallInvestments += investmentsPerPaycheck;
      overallLivingExpenses += livingExpensesPerPaycheck;
      overallGoals += goalAllocationsPerPaycheck.reduce((sum, allocation) => sum + allocation.amount, 0);

      return {
        paycheckNumber: monthIdx * 2 + paycheckIdx + 1,
        date: paycheckDate.toISOString(),
        income: Math.round(perPaycheck),
        savings: savingsPerPaycheck,
        investments: investmentsPerPaycheck,
        livingExpenses: livingExpensesPerPaycheck,
        goalAllocations: cloneGoalAllocations(goalAllocationsPerPaycheck),
      };
    });

    return {
      month: monthIdx + 1,
      monthName: monthNames[monthDate.getMonth()],
      totalIncome: plan.monthlyIncome,
      paychecks,
      monthTotals: {
        income: plan.monthlyIncome,
        savings: savingsPerPaycheck * 2,
        investments: investmentsPerPaycheck * 2,
        livingExpenses: livingExpensesPerPaycheck * 2,
        goals: goalTotalsPerMonth,
      },
    };
  });

  return {
    createdDate: new Date().toISOString(),
    months,
    overallTotals: {
      totalIncome: plan.monthlyIncome * 3,
      totalSavings: overallSavings,
      totalInvestments: overallInvestments,
      totalLivingExpenses: overallLivingExpenses,
      totalGoals: overallGoals,
    },
  };
};

export const FinancialDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FinancialData>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem("financial_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved financial data:", e);
        return defaultData;
      }
    }
    return defaultData;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("financial_data", JSON.stringify(data));
  }, [data]);

  const applyGoalsUpdate = (prev: FinancialData, goals: Goal[]) => ({
    ...prev,
    goals,
    ninetyDayPlan: prev.financialPlan ? buildNinetyDayPlan(prev.financialPlan, goals) : prev.ninetyDayPlan,
    lastUpdated: new Date().toISOString(),
  });

  const setGoals = (goals: Goal[]) => {
    setData((prev) => applyGoalsUpdate(prev, goals));
  };

  const addGoal = (goal: Goal) => {
    setData((prev) => applyGoalsUpdate(prev, [...prev.goals, goal]));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData((prev) =>
      applyGoalsUpdate(
        prev,
        prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      ),
    );
  };

  const removeGoal = (id: string) => {
    setData((prev) => applyGoalsUpdate(prev, prev.goals.filter((g) => g.id !== id)));
  };

  const setAccounts = (accounts: Account[]) => {
    setData((prev) => ({
      ...prev,
      accounts,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setBills = (bills: Bill[]) => {
    setData((prev) => ({
      ...prev,
      bills,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setTransactions = (transactions: Transaction[]) => {
    setData((prev) => ({
      ...prev,
      transactions,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const setFinancialPlan = (plan: FinancialPlan) => {
    setData((prev) => {
      const nextPlan = plan;
      const shouldGeneratePlan = prev.goals.length > 0;

      return {
        ...prev,
        financialPlan: nextPlan,
        ninetyDayPlan: shouldGeneratePlan ? buildNinetyDayPlan(nextPlan, prev.goals) : prev.ninetyDayPlan,
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const normalizePercentages = (plan: FinancialPlan): FinancialPlan => {
    const percentSum =
      plan.savingsPercentage + plan.investmentsPercentage + plan.livingExpensesPercentage;
    if (percentSum === 100) {
      return plan;
    }

    if (percentSum === 0) {
      const equalShare = Math.round((100 / 3) * 100) / 100;
      return {
        ...plan,
        savingsPercentage: equalShare,
        investmentsPercentage: equalShare,
        livingExpensesPercentage: 100 - equalShare * 2,
      };
    }

    const ratio = 100 / percentSum;
    const normalize = (value: number) => Math.max(0, Math.round(value * ratio * 100) / 100);
    const normalizedSavings = normalize(plan.savingsPercentage);
    const normalizedInvestments = normalize(plan.investmentsPercentage);
    let normalizedLiving = normalize(plan.livingExpensesPercentage);

    const adjustment = Math.round(
      (100 - (normalizedSavings + normalizedInvestments + normalizedLiving)) * 100,
    ) / 100;
    normalizedLiving += adjustment;

    return {
      ...plan,
      savingsPercentage: normalizedSavings,
      investmentsPercentage: normalizedInvestments,
      livingExpensesPercentage: normalizedLiving,
    };
  };

  const adjustFinancialPlan = (updates: Partial<FinancialPlan>): FinancialPlan => {
    let nextPlan: FinancialPlan = (data.financialPlan ?? {
      savingsPercentage: 20,
      investmentsPercentage: 15,
      livingExpensesPercentage: 65,
      monthlyIncome: 0,
      yearlyIncome: 0,
    }) as FinancialPlan;

    setData((prev) => {
      const previousPlan: FinancialPlan =
        prev.financialPlan || {
          savingsPercentage: 20,
          investmentsPercentage: 15,
          livingExpensesPercentage: 65,
          monthlyIncome: 0,
          yearlyIncome: 0,
        };

      const merged: FinancialPlan = {
        ...previousPlan,
        ...updates,
      };

      const percentFlags = {
        savings: updates.savingsPercentage !== undefined,
        investments: updates.investmentsPercentage !== undefined,
        living: updates.livingExpensesPercentage !== undefined,
      };

      const percentValues = {
        savings: merged.savingsPercentage,
        investments: merged.investmentsPercentage,
        living: merged.livingExpensesPercentage,
      };

      const specifiedSum =
        (percentFlags.savings ? percentValues.savings : 0) +
        (percentFlags.investments ? percentValues.investments : 0) +
        (percentFlags.living ? percentValues.living : 0);

      const unspecifiedKeys = Object.entries(percentFlags)
        .filter(([, flagged]) => !flagged)
        .map(([key]) => key as "savings" | "investments" | "living");

      if (unspecifiedKeys.length > 0) {
        const remainder = 100 - specifiedSum;
        const currentUnspecifiedTotal = unspecifiedKeys.reduce(
          (sum, key) => sum + percentValues[key],
          0,
        );

        if (remainder >= 0) {
          if (currentUnspecifiedTotal === 0) {
            const share = remainder / unspecifiedKeys.length;
            unspecifiedKeys.forEach((key, index) => {
              const value = index === unspecifiedKeys.length - 1 ? remainder - share * index : share;
              percentValues[key] = Math.max(0, Math.round(value * 100) / 100);
            });
          } else {
            unspecifiedKeys.forEach((key, index) => {
              const base = percentValues[key];
              const proportion = base / currentUnspecifiedTotal || 1 / unspecifiedKeys.length;
              const value = proportion * remainder;
              percentValues[key] = Math.max(0, Math.round(value * 100) / 100);
              if (index === unspecifiedKeys.length - 1) {
                const assigned =
                  unspecifiedKeys.slice(0, -1).reduce((sum, k) => sum + percentValues[k], 0) +
                  percentValues[key];
                const diff = Math.round((100 - (specifiedSum + assigned)) * 100) / 100;
                percentValues[key] += diff;
              }
            });
          }
        } else {
          const scaling = 100 / (specifiedSum === 0 ? 100 : specifiedSum);
          if (percentFlags.savings) {
            percentValues.savings = Math.max(0, Math.round(percentValues.savings * scaling * 100) / 100);
          }
          if (percentFlags.investments) {
            percentValues.investments = Math.max(0, Math.round(percentValues.investments * scaling * 100) / 100);
          }
          if (percentFlags.living) {
            percentValues.living = Math.max(0, Math.round(percentValues.living * scaling * 100) / 100);
          }
          unspecifiedKeys.forEach((key) => {
            percentValues[key] = Math.max(0, Math.round(percentValues[key] * scaling * 100) / 100);
          });
        }

        merged.savingsPercentage = percentValues.savings;
        merged.investmentsPercentage = percentValues.investments;
        merged.livingExpensesPercentage = percentValues.living;
      }

      const normalized = normalizePercentages({
        ...merged,
        savingsPercentage: percentValues.savings,
        investmentsPercentage: percentValues.investments,
        livingExpensesPercentage: percentValues.living,
      });

      const monthlyUpdated = updates.monthlyIncome !== undefined;
      const yearlyUpdated = updates.yearlyIncome !== undefined;

      if (monthlyUpdated && !yearlyUpdated) {
        normalized.yearlyIncome = Math.round(normalized.monthlyIncome * 12 * 100) / 100;
      } else if (!monthlyUpdated && yearlyUpdated) {
        normalized.monthlyIncome = Math.round((normalized.yearlyIncome / 12) * 100) / 100;
      }

      nextPlan = normalized;

      return {
        ...prev,
        financialPlan: normalized,
        ninetyDayPlan: prev.goals.length > 0 ? buildNinetyDayPlan(normalized, prev.goals) : prev.ninetyDayPlan,
        lastUpdated: new Date().toISOString(),
      };
    });

    return nextPlan;
  };

  const setNinetyDayPlan = (plan: NinetyDayPlan) => {
    setData((prev) => ({
      ...prev,
      ninetyDayPlan: plan,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateData = (updates: Partial<FinancialData>) => {
    setData((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const clearAllData = () => {
    setData(defaultData);
    localStorage.removeItem("financial_data");
  };

  // Generate a text summary that AI can use
  const getFinancialSummary = (): string => {
    const { goals, accounts, bills, transactions, financialPlan, ninetyDayPlan } = data;

    let summary = "Financial Overview:\n\n";

    // Income
    if (financialPlan) {
      summary += `Monthly Income: $${financialPlan.monthlyIncome.toLocaleString()}\n`;
      summary += `Annual Income: $${financialPlan.yearlyIncome.toLocaleString()}\n\n`;
      
      summary += `Financial Allocation:\n`;
      summary += `- Savings: ${financialPlan.savingsPercentage}% ($${Math.round((financialPlan.monthlyIncome * financialPlan.savingsPercentage) / 100).toLocaleString()}/month)\n`;
      summary += `- Investments: ${financialPlan.investmentsPercentage}% ($${Math.round((financialPlan.monthlyIncome * financialPlan.investmentsPercentage) / 100).toLocaleString()}/month)\n`;
      summary += `- Living Expenses: ${financialPlan.livingExpensesPercentage}% ($${Math.round((financialPlan.monthlyIncome * financialPlan.livingExpensesPercentage) / 100).toLocaleString()}/month)\n\n`;
    }

    // Goals
    if (goals.length > 0) {
      summary += `Financial Goals (${goals.length}):\n`;
      goals.forEach((goal) => {
        const progress = goal.currentAmount ? Math.round((goal.currentAmount / goal.amount) * 100) : 0;
        summary += `- ${goal.name}: Target $${goal.amount.toLocaleString()} by ${new Date(goal.targetDate).toLocaleDateString()} `;
        summary += `(${progress}% complete, allocating $${goal.monthlyAllocation}/month)\n`;
      });
      summary += "\n";
    }

    // Accounts
    if (accounts.length > 0) {
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      summary += `Accounts (${accounts.length}):\n`;
      summary += `Total Balance: $${totalBalance.toLocaleString()}\n`;
      accounts.forEach((acc) => {
        summary += `- ${acc.nickname} (${acc.type}): $${acc.balance.toLocaleString()}`;
        if (acc.rewards > 0) summary += ` + ${acc.rewards} rewards points`;
        summary += "\n";
      });
      summary += "\n";
    }

    // Bills
    if (bills.length > 0) {
      const totalBills = bills.reduce((sum, bill) => sum + bill.payment_amount, 0);
      summary += `Monthly Bills (${bills.length}):\n`;
      summary += `Total: $${totalBills.toLocaleString()}/month\n`;
      bills.forEach((bill) => {
        summary += `- ${bill.payee}: $${bill.payment_amount.toLocaleString()} (${bill.status})\n`;
      });
      summary += "\n";
    }

    // Recent Transactions
    if (transactions.length > 0) {
      const recent = transactions.slice(0, 5);
      summary += `Recent Transactions (${transactions.length} total, showing last 5):\n`;
      recent.forEach((txn) => {
        summary += `- ${new Date(txn.transaction_date).toLocaleDateString()}: ${txn.description || txn.type} - $${txn.amount.toLocaleString()}\n`;
      });
      summary += "\n";
    }

    // 90-Day Plan
    if (ninetyDayPlan) {
      summary += `90-Day Financial Plan:\n`;
      summary += `Created: ${new Date(ninetyDayPlan.createdDate).toLocaleDateString()}\n`;
      summary += `Total Income (90 days): $${ninetyDayPlan.overallTotals.totalIncome.toLocaleString()}\n`;
      summary += `Total Savings: $${ninetyDayPlan.overallTotals.totalSavings.toLocaleString()}\n`;
      summary += `Total Investments: $${ninetyDayPlan.overallTotals.totalInvestments.toLocaleString()}\n`;
      summary += `Total Living Expenses: $${ninetyDayPlan.overallTotals.totalLivingExpenses.toLocaleString()}\n`;
      if (ninetyDayPlan.overallTotals.totalGoals > 0) {
        summary += `Total Goal Allocations: $${ninetyDayPlan.overallTotals.totalGoals.toLocaleString()}\n`;
      }
    }

    return summary;
  };

  return (
    <FinancialDataContext.Provider
      value={{
        data,
        setGoals,
        addGoal,
        updateGoal,
        removeGoal,
        setAccounts,
        setBills,
        setTransactions,
        setFinancialPlan,
        setNinetyDayPlan,
        adjustFinancialPlan,
        updateData,
        clearAllData,
        getFinancialSummary,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error("useFinancialData must be used within a FinancialDataProvider");
  }
  return context;
};

