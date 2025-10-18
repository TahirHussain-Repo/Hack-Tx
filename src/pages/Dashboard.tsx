import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  return (
    <div className="animate-fade-in-up">
      <Header 
        title="Welcome back, Alex." 
        subtitle="Here's your financial overview for October 2025."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard hover className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Spending</h3>
          <p className="text-2xl font-bold text-foreground">$3,247.82</p>
          <p className="text-xs text-destructive mt-2">↓ 12% from last month</p>
        </GlassCard>

        <GlassCard hover className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Savings Rate</h3>
          <p className="text-2xl font-bold text-foreground">32%</p>
          <p className="text-xs text-primary mt-2">↑ 5% from last month</p>
        </GlassCard>

        <GlassCard hover className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Budget Adherence</h3>
          <p className="text-2xl font-bold text-foreground">87%</p>
          <Progress value={87} className="mt-3 h-2" />
        </GlassCard>

        <GlassCard hover className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
              <CreditCard className="h-6 w-6 text-accent" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Subscriptions</h3>
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground mt-2">$347/month total</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Spending vs Budget</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-48 h-48 rounded-full border-8 border-primary/30 flex items-center justify-center mb-4 mx-auto">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">87%</p>
                    <p className="text-sm text-muted-foreground">of budget used</p>
                  </div>
                </div>
                <p className="text-sm">$3,247 spent of $3,750 budget</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-semibold mb-4 relative z-10">AI Recap</h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 rounded-full bg-primary/50 animate-pulse"></div>
              <div className="w-8 h-1 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-16 h-1 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Great job this month! Your spending is down 12% and you're saving more than ever. 
              Keep it up and you'll hit your Paris trip goal 2 months early.
            </p>
            <button className="w-full py-2 px-4 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-colors border border-primary/30">
              🎧 Listen to Summary
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard hover>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Active Goals
          </h3>
          <div className="space-y-4">
            {[
              { name: "Trip to Paris", progress: 68, target: "$5,000", current: "$3,400" },
              { name: "Emergency Fund", progress: 45, target: "$10,000", current: "$4,500" },
              { name: "New Laptop", progress: 90, target: "$2,000", current: "$1,800" },
            ].map((goal) => (
              <div key={goal.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{goal.name}</span>
                  <span className="text-xs text-muted-foreground">{goal.current} / {goal.target}</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            Upcoming Renewals
          </h3>
          <div className="space-y-3">
            {[
              { name: "Netflix Premium", date: "Oct 28", amount: "$19.99" },
              { name: "Spotify Family", date: "Oct 30", amount: "$16.99" },
              { name: "Adobe Creative", date: "Nov 1", amount: "$54.99" },
            ].map((sub) => (
              <div key={sub.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.date}</p>
                </div>
                <span className="text-sm font-semibold text-accent">{sub.amount}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
