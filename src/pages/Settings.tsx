import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { User, Bell, Shield, Palette, CreditCard, RefreshCw, Database, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { AIContextExample } from "@/components/AIContextExample";

export default function Settings() {
  const navigate = useNavigate();
  const { data, clearAllData } = useFinancialData();

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    toast.success('Onboarding reset! Redirecting...');
    setTimeout(() => {
      navigate('/onboarding/1');
      window.location.reload();
    }, 1000);
  };

  const handleClearFinancialData = () => {
    if (window.confirm('Are you sure you want to clear all financial data? This cannot be undone.')) {
      clearAllData();
      toast.success('All financial data cleared!');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <Header title="Settings" subtitle="Customize your MoneyTalks experience" />

      <div className="space-y-6">
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Account</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div>
                <p className="font-medium">Alex Thompson</p>
                <p className="text-sm text-muted-foreground">alex.thompson@email.com</p>
              </div>
              <Button variant="ghost" size="sm" className="focus-ring">Edit</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div>
                <p className="font-medium">Connected Banks</p>
                <p className="text-sm text-muted-foreground">2 accounts connected</p>
              </div>
              <Button variant="ghost" size="sm" className="focus-ring">Manage</Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent/20">
              <Palette className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Personalization</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div>
                <p className="font-medium">AI Voice Tone</p>
                <p className="text-sm text-muted-foreground">Professional</p>
              </div>
              <Button variant="ghost" size="sm" className="focus-ring">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">USD ($)</p>
              </div>
              <Button variant="ghost" size="sm" className="focus-ring">Change</Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Bill reminders", description: "Get notified before bills are due" },
              { label: "Savings milestones", description: "Celebrate when you reach goals" },
              { label: "Unusual spending", description: "Alert on transactions above $100" },
              { label: "Weekly summaries", description: "Email recap every Sunday" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Privacy & Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div>
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
              <Button variant="ghost" size="sm" className="focus-ring">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div>
                <p className="font-medium">Data sharing</p>
                <p className="text-sm text-muted-foreground">AI training opt-out enabled</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent/20">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Plan</h3>
          </div>
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-lg">MoneyTalks Pro</p>
                <p className="text-sm text-muted-foreground">Unlimited AI insights & automation</p>
              </div>
              <p className="text-2xl font-bold text-primary">$12<span className="text-sm">/mo</span></p>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground focus-ring">Upgrade Plan</Button>
          </div>
        </GlassCard>

        {/* AI Context Preview */}
        <AIContextExample />

        {/* Financial Data */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/20">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Financial Data</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Goals</p>
                  <p className="font-bold text-foreground">{data.goals.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Accounts</p>
                  <p className="font-bold text-foreground">{data.accounts.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bills</p>
                  <p className="font-bold text-foreground">{data.bills.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transactions</p>
                  <p className="font-bold text-foreground">{data.transactions.length}</p>
                </div>
              </div>
              {data.lastUpdated && (
                <p className="text-xs text-muted-foreground mt-3">
                  Last updated: {new Date(data.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-destructive/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-destructive/20">
              <RefreshCw className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Development Tools</h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="mb-3">
                <p className="font-medium">Reset Onboarding</p>
                <p className="text-sm text-muted-foreground">Clear onboarding progress and restart the setup flow</p>
              </div>
              <Button 
                onClick={handleResetOnboarding}
                variant="destructive" 
                className="w-full focus-ring"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Onboarding
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="mb-3">
                <p className="font-medium">Clear Financial Data</p>
                <p className="text-sm text-muted-foreground">Delete all stored financial information</p>
              </div>
              <Button 
                onClick={handleClearFinancialData}
                variant="outline" 
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 focus-ring"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
