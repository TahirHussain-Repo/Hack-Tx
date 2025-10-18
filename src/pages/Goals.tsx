import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Target, TrendingUp, Calendar, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const goals = [
  {
    id: 1,
    name: "Trip to Paris",
    target: 5000,
    current: 3400,
    deadline: "Jun 2026",
    category: "Travel",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Emergency Fund",
    target: 10000,
    current: 4500,
    deadline: "Dec 2026",
    category: "Security",
    color: "from-primary to-primary/70",
  },
  {
    id: 3,
    name: "New Laptop",
    target: 2000,
    current: 1800,
    deadline: "Nov 2025",
    category: "Tech",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    name: "House Down Payment",
    target: 50000,
    current: 12500,
    deadline: "Dec 2027",
    category: "Property",
    color: "from-accent to-accent/70",
  },
];

export default function Goals() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <Header title="Goals" subtitle="Track your financial milestones" />
        <Button className="gradient-primary hover:opacity-90">
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
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <span className="text-xs text-muted-foreground">{goal.category}</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>

              <Progress value={progress} className="h-3 mb-4" />

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

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {goal.deadline}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <TrendingUp className="h-4 w-4" />
                  ${remaining.toLocaleString()} to go
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary">
                  💡 Save ${Math.ceil(remaining / 12)}/month to reach on time
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
