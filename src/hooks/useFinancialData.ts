import { useState } from "react";
import {
  mockGoals,
  mockSubscriptions,
  mockBudgetData,
  mockSpendingCategories,
  mockTransactions,
  type Goal,
  type Subscription,
  type BudgetData,
  type SpendingCategory,
  type Transaction,
} from "@/lib/mockData";

export const useFinancialData = () => {
  const [goals] = useState<Goal[]>(mockGoals);
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [budgetData] = useState<BudgetData>(mockBudgetData);
  const [spendingCategories] = useState<SpendingCategory[]>(mockSpendingCategories);
  const [transactions] = useState<Transaction[]>(mockTransactions);

  // Calculate derived data
  const activeSubscriptionsCount = subscriptions.filter((s) => s.status === "active").length;
  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const activeGoalsCount = goals.length;

  return {
    goals,
    subscriptions,
    budgetData,
    spendingCategories,
    transactions,
    // Derived data
    activeSubscriptionsCount,
    totalSubscriptionCost,
    activeGoalsCount,
  };
};

