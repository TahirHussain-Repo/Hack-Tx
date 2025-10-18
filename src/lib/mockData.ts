// Centralized mock data for the entire application

export interface Transaction {
  id: string;
  date: Date;
  merchant: string;
  category: string;
  amount: number;
  type: "debit" | "credit";
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  color: string;
  iconColor: string;
}

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  nextRenewal: string;
  status: "active" | "trial" | "cancelled";
  category: string;
}

export interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface BudgetData {
  totalSpending: number;
  budgetLimit: number;
  savingsRate: number;
  budgetAdherence: number;
}

// Mock Transactions
export const mockTransactions: Transaction[] = [
  { id: "1", date: new Date("2025-10-15"), merchant: "Whole Foods", category: "Food", amount: 87.32, type: "debit" },
  { id: "2", date: new Date("2025-10-14"), merchant: "Shell Gas", category: "Transport", amount: 45.00, type: "debit" },
  { id: "3", date: new Date("2025-10-13"), merchant: "Netflix", category: "Entertainment", amount: 19.99, type: "debit" },
  { id: "4", date: new Date("2025-10-12"), merchant: "Salary Deposit", category: "Income", amount: 3500.00, type: "credit" },
  { id: "5", date: new Date("2025-10-11"), merchant: "Amazon", category: "Shopping", amount: 156.78, type: "debit" },
];

// Mock Goals
export const mockGoals: Goal[] = [
  {
    id: 1,
    name: "Trip to Paris",
    target: 5000,
    current: 3400,
    deadline: "Jun 2026",
    category: "Travel",
    color: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    id: 2,
    name: "Emergency Fund",
    target: 10000,
    current: 4500,
    deadline: "Dec 2026",
    category: "Security",
    color: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    id: 3,
    name: "New Laptop",
    target: 2000,
    current: 1800,
    deadline: "Nov 2025",
    category: "Tech",
    color: "bg-accent/20",
    iconColor: "text-accent",
  },
  {
    id: 4,
    name: "House Down Payment",
    target: 50000,
    current: 12500,
    deadline: "Dec 2027",
    category: "Property",
    color: "bg-accent/20",
    iconColor: "text-accent",
  },
];

// Mock Subscriptions
export const mockSubscriptions: Subscription[] = [
  { id: 1, name: "Netflix Premium", amount: 19.99, nextRenewal: "Oct 28, 2025", status: "active", category: "Entertainment" },
  { id: 2, name: "Spotify Family", amount: 16.99, nextRenewal: "Oct 30, 2025", status: "active", category: "Music" },
  { id: 3, name: "Adobe Creative Cloud", amount: 54.99, nextRenewal: "Nov 1, 2025", status: "active", category: "Software" },
  { id: 4, name: "Amazon Prime", amount: 14.99, nextRenewal: "Nov 5, 2025", status: "trial", category: "Shopping" },
  { id: 5, name: "ChatGPT Plus", amount: 20.0, nextRenewal: "Nov 8, 2025", status: "active", category: "AI Tools" },
  { id: 6, name: "Notion Pro", amount: 10.0, nextRenewal: "Nov 12, 2025", status: "active", category: "Productivity" },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Budget Goal Reached",
    message: "You stayed under budget in Dining Out this month",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    type: "warning",
    title: "Subscription Renewal",
    message: "Netflix Premium renews in 2 days ($19.99)",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "3",
    type: "info",
    title: "Savings Update",
    message: "You've saved 12% more than last month",
    time: "1 day ago",
    unread: false,
  },
  {
    id: "4",
    type: "warning",
    title: "Large Transaction Detected",
    message: "Amazon purchase of $156.78 detected",
    time: "2 days ago",
    unread: false,
  },
  {
    id: "5",
    type: "success",
    title: "Goal Milestone",
    message: "Paris trip fund is now 68% complete!",
    time: "3 days ago",
    unread: false,
  },
];

// Mock Spending Categories
export const mockSpendingCategories: SpendingCategory[] = [
  { name: "Housing", amount: 1200, percentage: 37, color: "bg-primary" },
  { name: "Food", amount: 450, percentage: 14, color: "bg-accent" },
  { name: "Transport", amount: 280, percentage: 9, color: "bg-primary/70" },
  { name: "Entertainment", amount: 320, percentage: 10, color: "bg-accent/70" },
  { name: "Shopping", amount: 380, percentage: 12, color: "bg-primary/50" },
  { name: "Other", amount: 617, percentage: 18, color: "bg-muted" },
];

// Mock Budget Data
export const mockBudgetData: BudgetData = {
  totalSpending: 3247.82,
  budgetLimit: 3750,
  savingsRate: 32,
  budgetAdherence: 87,
};

// AI Insights
export const mockAIInsights = [
  {
    title: "Spending Pattern Detected",
    description: "Your entertainment spending increased 15% this week. Consider reviewing subscriptions.",
    confidence: "High" as const,
  },
  {
    title: "Optimization Opportunity",
    description: "Switching to annual Adobe plan could save $108/year.",
    confidence: "Medium" as const,
  },
  {
    title: "Goal Progress",
    description: "You're on track to reach your Paris trip goal 2 months early.",
    confidence: "High" as const,
  },
];

// Autopilot Automations
export const mockAutomations = [
  { name: "Smart Budget Allocation", status: "active", description: "Automatically distributes income across categories" },
  { name: "Bill Payment Optimizer", status: "active", description: "Schedules payments for optimal cash flow" },
  { name: "Savings Sweep", status: "active", description: "Moves excess funds to savings weekly" },
  { name: "Subscription Monitoring", status: "active", description: "Alerts on price changes and renewals" },
];

// Pending Approvals
export const mockPendingApprovals = [
  { action: "Cancel unused Hulu subscription", savings: "$14.99/mo", confidence: "High" as const },
  { action: "Switch to annual Adobe plan", savings: "$108/year", confidence: "Medium" as const },
  { action: "Increase emergency fund allocation", amount: "+$50/mo", confidence: "High" as const },
];

