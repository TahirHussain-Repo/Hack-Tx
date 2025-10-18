import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Zap, Shield, DollarSign, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function Autopilot() {
  return (
    <div className="animate-fade-in-up">
      <Header 
        title="Autopilot" 
        subtitle="Let AI manage your financial decisions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl gradient-primary">
                  <Zap className="h-6 w-6 text-card-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Autopilot Status</h3>
              </div>
              <Switch defaultChecked />
            </div>
            <p className="text-3xl font-bold text-primary mb-2">Active</p>
            <p className="text-sm text-muted-foreground">Managing 8 automated tasks</p>
          </div>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Safety Settings</h3>
          </div>
          <p className="text-2xl font-bold mb-2">$500</p>
          <p className="text-sm text-muted-foreground">Maximum auto-approval limit</p>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/20">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Automated Savings</h3>
          </div>
          <p className="text-2xl font-bold mb-2">$347</p>
          <p className="text-sm text-muted-foreground">Saved this month</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-6">Active Automations</h3>
          <div className="space-y-4">
            {[
              { name: "Smart Budget Allocation", status: "active", description: "Automatically distributes income across categories" },
              { name: "Bill Payment Optimizer", status: "active", description: "Schedules payments for optimal cash flow" },
              { name: "Savings Sweep", status: "active", description: "Moves excess funds to savings weekly" },
              { name: "Subscription Monitoring", status: "active", description: "Alerts on price changes and renewals" },
            ].map((automation) => (
              <div key={automation.name} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{automation.name}</h4>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">{automation.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-6">Pending Approvals</h3>
          <div className="space-y-4">
            {[
              { action: "Cancel unused Hulu subscription", savings: "$14.99/mo", confidence: "High" },
              { action: "Switch to annual Adobe plan", savings: "$108/year", confidence: "Medium" },
              { action: "Increase emergency fund allocation", amount: "+$50/mo", confidence: "High" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.action}</h4>
                    <p className="text-sm text-primary">
                      {'savings' in item ? `Save ${item.savings}` : item.amount}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.confidence === "High" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-accent/20 text-accent"
                  }`}>
                    {item.confidence} confidence
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gradient-primary">
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="bg-destructive/10 border-destructive/20">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-destructive/20">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Pause Autopilot</h3>
            <p className="text-sm text-muted-foreground">
              Temporarily disable all automated financial decisions
            </p>
          </div>
          <Button variant="destructive">Pause</Button>
        </div>
      </GlassCard>
    </div>
  );
}
