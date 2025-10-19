import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Target, TrendingUp, Calendar, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function Goals() {
  const { data } = useFinancialData();
  const { goals } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (goals.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <Header title="Goals" subtitle="Track your financial milestones" />
        <GlassCard className="text-center p-12">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Goals Set Yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete the onboarding process to set your financial goals.
          </p>
          <Button className="gradient-primary text-primary-foreground hover:opacity-90 focus-ring">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <Header title="Goals" subtitle="Track your financial milestones" />
        <Button className="gradient-primary text-primary-foreground hover:opacity-90 focus-ring">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const current = goal.currentAmount || 0;
          const progress = (current / goal.amount) * 100;
          const remaining = goal.amount - current;

          return (
            <GlassCard key={goal.id} hover className="group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {goal.emoji} {formatDate(goal.targetDate)}
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>

              <Progress value={progress} className="h-2 mb-4" />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(current)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(goal.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(goal.targetDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <TrendingUp className="h-4 w-4" />
                  {formatCurrency(remaining)} to go
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <p className="text-xs text-muted-foreground">
                  Allocating: {formatCurrency(goal.monthlyAllocation)}/month
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
