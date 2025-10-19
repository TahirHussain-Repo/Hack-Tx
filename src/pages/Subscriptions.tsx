import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { CreditCard, AlertCircle, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";

export default function Subscriptions() {
  const { data } = useFinancialData();
  
  // Filter bills for subscriptions (recurring bills with amount < $100)
  const subscriptions = data.bills.filter(bill => 
    bill.status === 'recurring' && bill.payment_amount < 100
  );
  
  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.payment_amount, 0);
  const activeSubscriptionsCount = subscriptions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSubscriptionCost)}</p>
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
            <h3 className="text-sm font-medium text-muted-foreground">Yearly Cost</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSubscriptionCost * 12)}</p>
        </GlassCard>
      </div>

      {subscriptions.length === 0 ? (
        <GlassCard className="text-center p-12">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Subscriptions Found</h3>
          <p className="text-muted-foreground">
            Complete the onboarding process to import your subscription data.
          </p>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub._id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{sub.payee}</h3>
                      <Badge variant="default" className="text-xs">
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {sub.recurring_date ? formatDate(sub.recurring_date) : 'Monthly'}
                      </span>
                      <span>•</span>
                      <span>Subscription</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold text-primary">{formatCurrency(sub.payment_amount)}</p>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity focus-ring">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
