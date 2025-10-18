# 🧠 In-Memory Financial Data System

This project uses an in-memory data management system (no backend needed!) that stores all financial data in React Context + localStorage.

## 📦 What's Stored

All financial data is stored client-side and persists across sessions:

- **Goals**: User-created financial goals with targets and monthly allocations
- **Accounts**: Bank accounts from Nessie API
- **Bills**: Monthly bills and subscriptions  
- **Transactions**: Deposits, withdrawals, purchases
- **Financial Plan**: Savings/investments/spending percentages

## 🎯 How to Use

### 1. Access Financial Data in Any Component

```tsx
import { useFinancialData } from '@/contexts/FinancialDataContext';

function MyComponent() {
  const { data, addGoal, updateGoal, removeGoal } = useFinancialData();
  
  // Access data
  console.log(data.goals);          // All goals
  console.log(data.accounts);       // All accounts
  console.log(data.financialPlan);  // Financial plan
  
  // Add a goal
  addGoal({
    id: 'goal-1',
    name: 'Vacation',
    amount: 5000,
    targetDate: '2025-12-31',
    monthlyAllocation: 500
  });
}
```

### 2. Use AI Context for Intelligent Responses

```tsx
import { useAIContext } from '@/hooks/useAIContext';

function AIChat() {
  const { getAIPromptContext, getQuickStats, getInsights } = useAIContext();
  
  // Get full context for AI (formatted string)
  const context = getAIPromptContext();
  
  // Get quick stats
  const stats = getQuickStats();
  console.log(stats.monthlyIncome);  // 8334
  console.log(stats.totalGoals);     // 3
  console.log(stats.savingsRate);    // 20
  
  // Get insights
  const insights = getInsights();
  // ["You have 3 active goals requiring $650/month", ...]
  
  // Use context in AI prompt
  const aiResponse = await generateAIResponse({
    userMessage: "How am I doing?",
    context: context
  });
}
```

### 3. Available Methods

**FinancialDataContext Methods:**
- `setGoals(goals)` - Replace all goals
- `addGoal(goal)` - Add a single goal
- `updateGoal(id, updates)` - Update goal by ID
- `removeGoal(id)` - Delete goal by ID
- `setAccounts(accounts)` - Save accounts
- `setBills(bills)` - Save bills
- `setTransactions(txns)` - Save transactions
- `setFinancialPlan(plan)` - Save financial plan
- `updateData(partial)` - Update any data
- `clearAllData()` - Delete everything
- `getFinancialSummary()` - Get formatted summary string

**AIContext Methods:**
- `getFullContext()` - Complete financial overview
- `getInsights()` - Array of AI-ready insights
- `getAIPromptContext()` - Formatted prompt for AI models
- `getQuickStats()` - Object with key metrics

## 📊 Data Flow

1. **Onboarding** → User completes onboarding → Data saved to context
2. **Context** → Data stored in React state + localStorage
3. **AI Agent** → Accesses data via `useAIContext()` hook
4. **Components** → Display and update data via `useFinancialData()`

## 🔍 Example: AI Response Generation

```tsx
function generateAIResponse(userMessage: string) {
  const { getAIPromptContext } = useAIContext();
  
  const prompt = `
    ${getAIPromptContext()}
    
    User Message: "${userMessage}"
    
    Provide personalized financial advice based on their data.
  `;
  
  // Send to your AI API (OpenAI, Anthropic, etc.)
  return callAI(prompt);
}
```

## 🛠️ Dev Tools

Go to **Settings** page to access:
- **AI Context Preview** - See what data AI can access
- **Financial Data Stats** - View stored data counts
- **Reset Onboarding** - Clear onboarding flag
- **Clear All Data** - Delete all financial data

## 💾 Data Persistence

- Stored in `localStorage` under key `financial_data`
- Survives page refreshes
- Cleared when user clears browser data
- No backend needed!

## 🚀 Adding New Data Types

1. Add type to `FinancialDataContext.tsx`:
```tsx
interface FinancialData {
  // ... existing
  myNewData: MyType[];
}
```

2. Add methods:
```tsx
const setMyNewData = (data: MyType[]) => {
  setData(prev => ({ ...prev, myNewData: data }));
};
```

3. Expose in context:
```tsx
return (
  <FinancialDataContext.Provider value={{
    // ... existing
    setMyNewData
  }}>
```

4. Use anywhere:
```tsx
const { setMyNewData } = useFinancialData();
setMyNewData([...]);
```

## 📝 Notes

- All data is client-side only
- No database or backend needed
- Perfect for hackathons and demos
- Easy to extend with more data types
- AI can access everything for personalized responses

---

**Questions?** Check `src/contexts/FinancialDataContext.tsx` for full implementation.

