import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { User, Bell, Shield, Palette, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function Settings() {
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
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium">Alex Thompson</p>
                <p className="text-sm text-muted-foreground">alex.thompson@email.com</p>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium">Connected Banks</p>
                <p className="text-sm text-muted-foreground">2 accounts connected</p>
              </div>
              <Button variant="ghost" size="sm">Manage</Button>
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
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium">AI Voice Tone</p>
                <p className="text-sm text-muted-foreground">Professional & Friendly</p>
              </div>
              <Button variant="ghost" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">USD ($)</p>
              </div>
              <Button variant="ghost" size="sm">Change</Button>
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
              <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
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
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div>
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
              <Button variant="ghost" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
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
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-lg">MoneyTalks Pro</p>
                <p className="text-sm text-muted-foreground">Unlimited AI insights & automation</p>
              </div>
              <p className="text-2xl font-bold text-primary">$12<span className="text-sm">/mo</span></p>
            </div>
            <Button className="w-full gradient-primary">Upgrade Plan</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
