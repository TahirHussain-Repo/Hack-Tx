import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";

export default function Insights() {
  const categories = [
    { name: "Housing", amount: 1200, percentage: 37, color: "bg-primary" },
    { name: "Food", amount: 450, percentage: 14, color: "bg-accent" },
    { name: "Transport", amount: 280, percentage: 9, color: "bg-blue-500" },
    { name: "Entertainment", amount: 320, percentage: 10, color: "bg-purple-500" },
    { name: "Shopping", amount: 380, percentage: 12, color: "bg-pink-500" },
    { name: "Other", amount: 617, percentage: 18, color: "bg-secondary" },
  ];

  return (
    <div className="animate-fade-in-up">
      <Header title="Insights" subtitle="Deep dive into your spending patterns" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Spending by Category
          </h3>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">${cat.amount}</span>
                    <span className="text-xs text-muted-foreground ml-2">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Trends
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 72, 58, 80, 75, 85, 70, 87].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all duration-500 hover:from-primary/80"
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"][i]}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">AI Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Your spending patterns show great discipline. Housing and essentials are well-managed. 
            Consider reducing entertainment expenses by 15% to accelerate your Paris trip goal.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Best category</span>
              <span className="text-primary font-medium">Transport (-22%)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Needs attention</span>
              <span className="text-accent font-medium">Shopping (+15%)</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/20">
              <TrendingDown className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Savings Opportunity</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            You have 3 overlapping subscriptions in the Entertainment category. 
            Consolidating these could save you $23.97/month.
          </p>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              Potential annual savings: $287.64
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
