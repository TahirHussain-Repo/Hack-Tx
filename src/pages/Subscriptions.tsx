import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { CreditCard, AlertCircle, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/hooks/useFinancialData";

export default function Subscriptions() {
  const { subscriptions, totalSubscriptionCost, activeSubscriptionsCount } = useFinancialData();

  return (
    <div className="animate-fade-in-up">
      <Header title="Subscriptions" subtitle="Manage your recurring expenses" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard hover>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Monthly</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">${totalSubscriptionCost.toFixed(2)}</p>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{activeSubscriptionsCount}</p>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Free Trials</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{subscriptions.filter(s => s.status === "trial").length}</p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{sub.name}</h3>
                    {sub.status === "trial" && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                        Trial
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {sub.nextRenewal}
                    </span>
                    <span>•</span>
                    <span>{sub.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-xl font-bold text-primary">${sub.amount}</p>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity focus-ring">
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
