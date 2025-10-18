import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Target, TrendingUp, Wallet, Plus, X } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useFinancialData } from "@/contexts/FinancialDataContext";

const API_KEY = "87ad7bec4c2410f7f823e0f11da33b53";
const CUSTOMER_ID = "68f400d39683f20dd519ea94";

interface Goal {
  id: string;
  name: string;
  amount: number;
  targetDate: string;
  monthlyAllocation: number;
}

const Onboarding3 = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { setGoals: saveGoals, setFinancialPlan } = useFinancialData();
  const [loading, setLoading] = useState(true);
  const [savings, setSavings] = useState(20);
  const [investments, setInvestments] = useState(10);
  const [monthlyIncome, setMonthlyIncome] = useState(8334);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  useEffect(() => {
    fetchMonthlyIncome();
  }, []);

  const fetchMonthlyIncome = async () => {
    try {
      // Fetch customer accounts
      const accountsResponse = await fetch(
        `http://api.nessieisreal.com/customers/${CUSTOMER_ID}/accounts?key=${API_KEY}`
      );
      const accounts = await accountsResponse.json();

      // Fetch deposits from all accounts
      let allDeposits: any[] = [];
      for (const account of accounts) {
        const depositsResponse = await fetch(
          `http://api.nessieisreal.com/accounts/${account._id}/deposits?key=${API_KEY}`
        );
        const deposits = await depositsResponse.json();
        if (Array.isArray(deposits)) {
          allDeposits = [...allDeposits, ...deposits];
        }
      }

      // Calculate monthly income from recent deposits
      if (allDeposits.length > 0) {
        const sortedDeposits = allDeposits
          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
          .slice(0, 2);
        const avgDeposit = sortedDeposits.reduce((sum, d) => sum + d.amount, 0) / sortedDeposits.length;
        setMonthlyIncome(Math.round(avgDeposit * 2));
      }
    } catch (error) {
      console.error("Error fetching income:", error);
      // Keep default value
    } finally {
      setLoading(false);
    }
  };

  // Calculate living expenses based on savings and investments
  const livingExpenses = 100 - savings - investments;
  
  const savingsAmount = Math.round((monthlyIncome * savings) / 100);
  const investmentsAmount = Math.round((monthlyIncome * investments) / 100);
  const livingExpensesAmount = Math.round((monthlyIncome * livingExpenses) / 100);

  const handleComplete = () => {
    // Save goals and financial plan to context
    saveGoals(goals);
    setFinancialPlan({
      savingsPercentage: savings,
      investmentsPercentage: investments,
      livingExpensesPercentage: livingExpenses,
      monthlyIncome,
      yearlyIncome: monthlyIncome * 12,
    });
    
    // Mark onboarding as complete
    completeOnboarding();
    
    // Navigate to dashboard
    navigate("/");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyAllocation = (targetAmount: number, targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const monthsRemaining = Math.max(
      1,
      Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    return Math.ceil(targetAmount / monthsRemaining);
  };

  const handleAddGoal = () => {
    if (!newGoalName || !newGoalAmount || !newGoalDate) return;

    const amount = parseFloat(newGoalAmount);
    if (isNaN(amount) || amount <= 0) return;

    const monthlyAllocation = calculateMonthlyAllocation(amount, newGoalDate);

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newGoalName,
      amount,
      targetDate: newGoalDate,
      monthlyAllocation,
    };

    setGoals([...goals, newGoal]);
    setNewGoalName("");
    setNewGoalAmount("");
    setNewGoalDate("");
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalMonthlyGoals = goals.reduce((sum, goal) => sum + goal.monthlyAllocation, 0);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-lg text-muted-foreground">Building your plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card animate-fade-in">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
        </div>

        <GlassCard className="p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">
              🎯 Let's build your money plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Set your focus and let MoneyTalks handle the numbers.
            </p>
          </div>

          {/* Sliders Section */}
          <GlassCard className="p-6 mb-6">
            <div className="space-y-6">
              {/* Savings Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <Label className="text-base font-semibold text-foreground">Savings</Label>
                  </div>
                  <span className="text-lg font-bold text-primary">{savings}%</span>
                </div>
                <Slider
                  value={[savings]}
                  onValueChange={(value) => {
                    const newSavings = value[0];
                    // Only update if it doesn't exceed 100% with investments
                    if (newSavings + investments <= 100) {
                      setSavings(newSavings);
                    }
                  }}
                  max={100}
                  step={1}
                  className="mb-1"
                />
              </div>

              {/* Investments Slider */}
              <div>
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-accent" />
                    </div>
                    <Label className="text-base font-semibold text-foreground">Investments</Label>
                  </div>
                  <span className="text-lg font-bold text-accent">{investments}%</span>
                </div>
                <Slider
                  value={[investments]}
                  onValueChange={(value) => {
                    const newInvestments = value[0];
                    // Only update if it doesn't exceed 100% with savings
                    if (savings + newInvestments <= 100) {
                      setInvestments(newInvestments);
                    }
                  }}
                  max={100}
                  step={1}
                  className="mb-1"
                />
              </div>

              {/* Living Expenses (calculated) */}
              <div>
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-foreground" />
                    </div>
                    <Label className="text-base font-semibold text-foreground">Living Expenses</Label>
                  </div>
                  <span className="text-lg font-bold text-foreground">{livingExpenses}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08]">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-muted to-foreground transition-all"
                    style={{ width: `${livingExpenses}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Generated Summary */}
          <GlassCard className="p-6 mb-6 bg-primary/5 border-primary/20">
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">💡</span>
                <p className="text-lg font-semibold text-foreground">
                  Based on your {formatCurrency(monthlyIncome)}/month take-home:
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <GlassCard className="p-4 text-center bg-white/[0.02]">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Save</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(savingsAmount)}
                </p>
              </GlassCard>
              <GlassCard className="p-4 text-center bg-white/[0.02]">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Invest</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(investmentsAmount)}
                </p>
              </GlassCard>
              <GlassCard className="p-4 text-center bg-white/[0.02]">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Spend</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(livingExpensesAmount)}
                </p>
              </GlassCard>
            </div>
          </GlassCard>

          {/* Goal Input */}
          <GlassCard className="p-6 mb-6 bg-accent/5 border-accent/20">
            <Label className="text-base font-semibold text-foreground mb-4 block flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Set Your Goals
            </Label>

            {/* Add New Goal Form */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  placeholder="Goal name (e.g., Paris Trip)"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Input 
                  type="number"
                  placeholder="Amount (e.g., 900)"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Input 
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08]"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddGoal}
                disabled={!newGoalName || !newGoalAmount || !newGoalDate}
                className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 disabled:opacity-50"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>

            {/* Goals List */}
            {goals.length > 0 && (
              <div className="space-y-3">
                <div className="h-px bg-white/[0.08] mb-4"></div>
                {goals.map((goal) => (
                  <div 
                    key={goal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{goal.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(goal.amount)} by {formatDate(goal.targetDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-accent">
                        <span>→ Auto allocates</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-accent/20">
                          {formatCurrency(goal.monthlyAllocation)}/month
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {/* Total Monthly Goals */}
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">Total Monthly for Goals:</span>
                    <span className="font-bold text-accent">{formatCurrency(totalMonthlyGoals)}</span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Preview Chart */}
          <GlassCard className="p-6 mb-8">
            <Label className="text-base font-semibold text-foreground mb-4 block">
              Your Money Plan
            </Label>
            <div className="space-y-4">
              {/* Bar chart */}
              <div className="h-16 flex rounded-lg overflow-hidden border border-white/[0.08]">
                <div 
                  className="bg-muted/60 flex items-center justify-center text-foreground text-sm font-semibold transition-all hover:bg-muted"
                  style={{ width: `${livingExpenses}%` }}
                >
                  {livingExpenses > 12 && `${livingExpenses}%`}
                </div>
                <div 
                  className="bg-primary/80 flex items-center justify-center text-background text-sm font-semibold transition-all hover:bg-primary"
                  style={{ width: `${savings}%` }}
                >
                  {savings > 12 && `${savings}%`}
                </div>
                <div 
                  className="bg-accent/80 flex items-center justify-center text-background text-sm font-semibold transition-all hover:bg-accent"
                  style={{ width: `${investments}%` }}
                >
                  {investments > 12 && `${investments}%`}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted/60"></div>
                  <span className="text-muted-foreground">Expenses ({livingExpenses}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Savings ({savings}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-muted-foreground">Investments ({investments}%)</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Final CTA */}
          <Button 
            onClick={handleComplete}
            className="w-full py-6 text-lg font-semibold gradient-primary hover:opacity-90"
          >
            Create My 90-Day Plan →
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};

export default Onboarding3;
