import { useState } from "react";
import { GlassCard } from "./GlassCard";
import { Button } from "./ui/button";
import { useAIContext } from "@/hooks/useAIContext";
import { Sparkles, Copy, Check } from "lucide-react";

/**
 * Example component showing how to use financial data for AI responses
 * This demonstrates how your AI agent can access user's financial context
 */
export const AIContextExample = () => {
  const { getAIPromptContext, getQuickStats, getInsights } = useAIContext();
  const [copied, setCopied] = useState(false);
  const stats = getQuickStats();
  const insights = getInsights();

  const handleCopy = async () => {
    const context = getAIPromptContext();
    await navigator.clipboard.writeText(context);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Context Available</h3>
          <p className="text-sm text-muted-foreground">
            This data is automatically available to your AI agent
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
          <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
          <p className="text-lg font-bold text-primary">
            ${stats.monthlyIncome.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
          <p className="text-xs text-muted-foreground mb-1">Active Goals</p>
          <p className="text-lg font-bold text-accent">{stats.totalGoals}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
          <p className="text-xs text-muted-foreground mb-1">Savings Rate</p>
          <p className="text-lg font-bold text-foreground">{stats.savingsRate}%</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
          <p className="text-xs text-muted-foreground mb-1">Monthly Bills</p>
          <p className="text-lg font-bold text-foreground">
            ${stats.totalBills.toLocaleString()}
          </p>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">AI Can Reference:</h4>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-white/[0.02]"
              >
                <span className="text-primary">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy AI Context Button */}
      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied to Clipboard!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Full AI Context
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Use this context when generating AI responses for personalized advice
      </p>
    </GlassCard>
  );
};

