import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Target, TrendingUp, Calendar, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/hooks/useFinancialData";

export default function Goals() {
  const { goals } = useFinancialData();

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
          const progress = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;

          return (
            <GlassCard key={goal.id} hover className="group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${goal.color} flex items-center justify-center`}>
                    <Target className={`h-6 w-6 ${goal.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <span className="text-xs text-muted-foreground">{goal.category}</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>

              <Progress value={progress} className="h-2 mb-4" />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${goal.current.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${goal.target.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {goal.deadline}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <TrendingUp className="h-4 w-4" />
                  ${remaining.toLocaleString()} to go
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <p className="text-xs text-muted-foreground">
                  Recommended: ${Math.ceil(remaining / 12)}/month to reach on time
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
