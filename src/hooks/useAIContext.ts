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
    const goalsEntries = getGoalsSummary();
    const goalsDetails = goalsEntries.length
      ? goalsEntries
          .map(
            (goal) =>
              `${goal.name}: target $${goal.target.toLocaleString()} by ${new Date(goal.targetDate).toLocaleDateString()} (${goal.progress.toLocaleString()} saved, $${goal.monthlyAllocation.toLocaleString()}/month allocation)`
          )
          .join("\n")
      : "No goals defined.";
    const planSnapshot = getNinetyDaySnapshot();
    const planSummary = planSnapshot
      ? `Created ${new Date(planSnapshot.createdDate).toLocaleDateString()}.
Total income (90d): $${planSnapshot.totals.totalIncome.toLocaleString()}
Total savings (90d): $${planSnapshot.totals.totalSavings.toLocaleString()}
Total investments (90d): $${planSnapshot.totals.totalInvestments.toLocaleString()}
Total living expenses (90d): $${planSnapshot.totals.totalLivingExpenses.toLocaleString()}
Total goals (90d): $${planSnapshot.totals.totalGoals.toLocaleString()}
Plan months: ${planSnapshot.months
        .map(
          (month) =>
            `${month.name}: savings $${month.totals.savings.toLocaleString()}, investments $${month.totals.investments.toLocaleString()}, living $${month.totals.livingExpenses.toLocaleString()}, goals $${month.totals.goals.toLocaleString()}`
        )
        .join(" | ")}`
      : "No plan on file.";

    return `
You are MoneyTalks, a personal financial AI advisor. Here is the user's current financial situation:

${getFinancialSummary()}

Goals Detail:
${goalsDetails}

90-Day Plan Summary:
${planSummary}

Key Insights:
${getInsights().map((insight, i) => `${i + 1}. ${insight}`).join("\n")}

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

  const getPercentages = () => {
    const { financialPlan } = data;
    return {
      savings: financialPlan?.savingsPercentage ?? 0,
      investments: financialPlan?.investmentsPercentage ?? 0,
      living: financialPlan?.livingExpensesPercentage ?? 0,
    };
  };

  const getIncome = () => {
    const { financialPlan } = data;
    return {
      monthly: financialPlan?.monthlyIncome ?? 0,
      yearly: financialPlan?.yearlyIncome ?? 0,
    };
  };

  const getGoalsSummary = () =>
    data.goals
      .map((goal) => ({
        id: goal.id,
        name: goal.name,
        target: goal.amount,
        targetDate: goal.targetDate,
        monthlyAllocation: goal.monthlyAllocation,
        progress: goal.currentAmount ?? 0,
      }))
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  const getNinetyDaySnapshot = () => {
    const { ninetyDayPlan } = data;
    if (!ninetyDayPlan) return null;

    return {
      createdDate: ninetyDayPlan.createdDate,
      totals: ninetyDayPlan.overallTotals,
      months: ninetyDayPlan.months.map((month) => ({
        month: month.month,
        name: month.monthName,
        totals: month.monthTotals,
      })),
    };
  };

  return {
    data,
    getFullContext,
    getInsights,
    getAIPromptContext,
    getQuickStats,
    getGoalsSummary,
    getPercentages,
    getIncome,
    getNinetyDaySnapshot,
  };
};

