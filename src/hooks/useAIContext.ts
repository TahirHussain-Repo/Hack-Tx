import { useFinancialData } from "@/contexts/FinancialDataContext";

/**
 * Custom hook that provides AI-ready context from financial data
 * Use this to generate prompts or context for AI responses
 */
export const useAIContext = () => {
  const { data, getFinancialSummary } = useFinancialData();

  /**
   * Get a complete financial summary as a formatted string
   * Perfect for AI prompt context
   */
  const getFullContext = () => {
    return getFinancialSummary();
  };

  /**
   * Get specific insights that AI can reference
   */
  const getInsights = () => {
    const { goals, financialPlan, bills, accounts } = data;

    const insights = [];

    // Goal progress insights
    if (goals.length > 0) {
      const totalMonthlyGoals = goals.reduce((sum, g) => sum + g.monthlyAllocation, 0);
      insights.push(`You have ${goals.length} active goals requiring $${totalMonthlyGoals}/month`);
      
      const nearestGoal = goals.sort((a, b) => 
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      )[0];
      if (nearestGoal) {
        insights.push(`Your nearest goal is "${nearestGoal.name}" targeted for ${new Date(nearestGoal.targetDate).toLocaleDateString()}`);
      }
    }

    // Spending insights
    if (financialPlan && bills.length > 0) {
      const totalBills = bills.reduce((sum, b) => sum + b.payment_amount, 0);
      const percentageOfIncome = ((totalBills / financialPlan.monthlyIncome) * 100).toFixed(1);
      insights.push(`Your bills ($${totalBills}) represent ${percentageOfIncome}% of your monthly income`);
    }

    // Savings insights
    if (financialPlan) {
      const savingsAmount = Math.round((financialPlan.monthlyIncome * financialPlan.savingsPercentage) / 100);
      const annualSavings = savingsAmount * 12;
      insights.push(`You're saving $${savingsAmount}/month ($${annualSavings}/year) at ${financialPlan.savingsPercentage}%`);
    }

    // Account balance
    if (accounts.length > 0) {
      const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      insights.push(`Total account balance: $${totalBalance.toLocaleString()}`);
    }

    return insights;
  };

  /**
   * Get a prompt-ready string for AI models
   */
  const getAIPromptContext = () => {
    return `
You are MoneyTalks, a personal financial AI advisor. Here is the user's current financial situation:

${getFullContext()}

Key Insights:
${getInsights().map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

When responding:
- Be conversational and supportive
- Reference specific numbers from their data
- Provide actionable advice
- Be encouraging about their progress
- Suggest optimizations when appropriate
`.trim();
  };

  /**
   * Get specific data points for quick reference
   */
  const getQuickStats = () => {
    const { financialPlan, goals, accounts, bills } = data;
    
    return {
      monthlyIncome: financialPlan?.monthlyIncome || 0,
      totalGoals: goals.length,
      totalAccounts: accounts.length,
      totalBills: bills.reduce((sum, b) => sum + b.payment_amount, 0),
      savingsRate: financialPlan?.savingsPercentage || 0,
      investmentRate: financialPlan?.investmentsPercentage || 0,
      nextGoalDeadline: goals.length > 0 
        ? goals.sort((a, b) => 
            new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
          )[0].targetDate
        : null,
    };
  };

  return {
    data,
    getFullContext,
    getInsights,
    getAIPromptContext,
    getQuickStats,
  };
};

