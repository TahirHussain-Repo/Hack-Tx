import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, Target, Wallet, Calendar, Sparkles, MessageSquare, CreditCard, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const COLORS = {
  essentials: 'hsl(215 15% 60%)',
  goals: 'hsl(158 64% 52%)',
  investments: 'hsl(45 93% 47%)',
  fun: 'hsl(280 70% 60%)'
};

export default function Plan() {
  const { data } = useFinancialData();
  const { ninetyDayPlan, goals, financialPlan, bills } = data;
  const navigate = useNavigate();

  if (!ninetyDayPlan || !financialPlan) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Let's create your money plan 🎯
          </h1>
          <p className="text-lg text-muted-foreground">
            I'll help you map out the next 90 days so you can reach your goals without stressing about money.
          </p>
        </div>
        <GlassCard className="text-center p-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Let me know about your income, goals, and what you want to save for. I'll handle the math.
          </p>
          <Button onClick={() => navigate('/onboarding/1')} className="gradient-primary text-lg px-8 py-6">
            Let's do this →
          </Button>
        </GlassCard>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stuff
  const monthlyBills = bills.reduce((sum, bill) => sum + bill.payment_amount, 0);
  const monthlySavings = ninetyDayPlan.overallTotals.totalSavings / 3;
  const monthlyGoals = ninetyDayPlan.overallTotals.totalGoals / 3;
  const leftoverMoney = financialPlan.monthlyIncome - monthlyBills - monthlySavings - monthlyGoals;
  
  const planStartDate = new Date(ninetyDayPlan.createdDate);
  const today = new Date();
  const daysIntoPlan = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(90 - daysIntoPlan, 0);
  
  // Check if on track
  const isDoingGreat = leftoverMoney > 0 && monthlySavings > 0;

  // Budget data for pie chart
  const budgetData = [
    { name: 'Bills & Essentials', value: monthlyBills, color: COLORS.essentials },
    { name: 'Savings', value: monthlySavings, color: COLORS.goals },
    { name: 'Goals', value: monthlyGoals, color: COLORS.investments },
    { name: 'Everything Else', value: Math.max(leftoverMoney, 0), color: COLORS.fun },
  ].filter(item => item.value > 0);

  return (
    <div className="animate-fade-in-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Here's your plan for the next {daysLeft} days 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          {isDoingGreat 
            ? "You're doing great! Here's how your money's working for you."
            : "Let's make sure every dollar has a job. Here's what's happening."
          }
        </p>
      </div>

      {/* The Big Picture */}
      <GlassCard className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <h2 className="text-2xl font-bold text-foreground mb-6">The big picture</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Every month, you bring in</div>
            <div className="text-4xl font-bold text-foreground mb-1">{formatCurrency(financialPlan.monthlyIncome)}</div>
            <div className="text-sm text-primary">That's {formatCurrency(financialPlan.monthlyIncome * 3)} over 90 days</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">You're putting away</div>
            <div className="text-4xl font-bold text-primary mb-1">{formatCurrency(monthlySavings)}</div>
            <div className="text-sm text-muted-foreground">each month toward savings</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-2">After everything's paid</div>
            <div className="text-4xl font-bold text-accent mb-1">{formatCurrency(Math.max(leftoverMoney, 0))}</div>
            <div className="text-sm text-muted-foreground">is yours to spend freely</div>
          </div>
        </div>
      </GlassCard>

      {/* Where Your Money Goes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Where your money goes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(215 25% 15%)', border: '1px solid hsl(0 0% 100% / 0.08)', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {budgetData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{formatCurrency(item.value)}/mo</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Your Goals */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Your goals</h3>
          {goals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-3">🎯</div>
              <p>No goals yet. What do you want to save for?</p>
              <Button onClick={() => navigate('/goals')} variant="outline" className="mt-4">
                Add a goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const current = goal.currentAmount || 0;
                const progress = (current / goal.amount) * 100;
                const monthsToGo = Math.ceil((goal.amount - current) / goal.monthlyAllocation);
                
                return (
                  <div key={goal.id} className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{goal.emoji}</span>
                          <h4 className="font-semibold text-foreground">{goal.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Putting aside {formatCurrency(goal.monthlyAllocation)} each month
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(current)} saved</div>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(goal.amount - current)} to go</span>
                      {monthsToGo <= 3 && <span className="text-primary">✨ Almost there!</span>}
                    </div>
                  </div>
                );
              })}
              {goals.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/goals')}>
                  See all {goals.length} goals
                </Button>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {/* What's Coming Up */}
      <GlassCard className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-6">What's coming up this month</h3>
        
        <div className="space-y-4">
          {/* Next payday */}
          {ninetyDayPlan.months[0]?.paychecks[0] && (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Wallet className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">Next payday</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(ninetyDayPlan.months[0].paychecks[0].income)} coming{' '}
                  {new Date(ninetyDayPlan.months[0].paychecks[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          )}

          {/* Bills */}
          {bills.length > 0 && (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">Bills this month</div>
                <div className="text-sm text-muted-foreground mb-2">
                  {formatCurrency(monthlyBills)} total across {bills.length} bills
                </div>
                <div className="flex flex-wrap gap-2">
                  {bills.slice(0, 3).map((bill) => (
                    <Badge key={bill._id} variant="outline" className="text-xs">
                      {bill.payee}: {formatCurrency(bill.payment_amount)}
                    </Badge>
                  ))}
                  {bills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{bills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Goals progress */}
          {goals.length > 0 && (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">Goal progress</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(monthlyGoals)} going toward {goals.length} {goals.length === 1 ? 'goal' : 'goals'} this month
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Suggestions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">A few thoughts 💭</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Good stuff */}
          {isDoingGreat && (
            <GlassCard className="p-6 border-green-500/30 bg-green-500/5">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground mb-1">You're on track!</div>
                  <p className="text-sm text-muted-foreground">
                    You've got {formatCurrency(leftoverMoney)} left over each month after everything's covered. 
                    That's a healthy cushion.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Subscriptions check */}
          {bills.filter(b => b.status === 'recurring' && b.payment_amount < 100).length > 0 && (
            <GlassCard className="p-6 border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground mb-1">Check your subscriptions</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    I spotted {bills.filter(b => b.status === 'recurring' && b.payment_amount < 100).length} recurring charges. 
                    Make sure you're using all of them.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/subscriptions')}>
                    Review subscriptions
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Goals suggestion */}
          {goals.length > 0 && (
            <GlassCard className="p-6 border-blue-500/30 bg-blue-500/5">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-foreground mb-1">Hit your goals faster</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you could save an extra $50/month, you'd reach {goals[0].name} 2 months sooner.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/goals')}>
                    Adjust goals
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Talk to AI */}
          <GlassCard className="p-6 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3 mb-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-foreground mb-1">Questions about your plan?</div>
                <p className="text-sm text-muted-foreground mb-3">
                  I'm here to help. Ask me anything about your money.
                </p>
                <Button size="sm" className="gradient-primary" onClick={() => navigate('/')}>
                  Start conversation
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick actions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/goals')}>
            <Target className="w-4 h-4 mr-2" />
            Manage goals
          </Button>
          <Button variant="outline" onClick={() => navigate('/subscriptions')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Check subscriptions
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Talk to advisor
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
