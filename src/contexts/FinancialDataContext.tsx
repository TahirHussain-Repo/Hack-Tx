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

  const setGoals = (goals: Goal[]) => {
    setData((prev) => ({
      ...prev,
      goals,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addGoal = (goal: Goal) => {
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, goal],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const removeGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
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
    setData((prev) => ({
      ...prev,
      financialPlan: plan,
      lastUpdated: new Date().toISOString(),
    }));
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

