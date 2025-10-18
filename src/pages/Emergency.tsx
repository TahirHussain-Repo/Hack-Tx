import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { AlertCircle, Shield, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Emergency() {
  return (
    <div className="animate-fade-in-up">
      <Header 
        title="Emergency Mode" 
        subtitle="Financial recovery and crisis management"
      />

      <GlassCard className="mb-8 bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <AlertCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Emergency Mode</h3>
            <p className="text-sm text-muted-foreground mb-4">
              When activated, I'll create a customized recovery plan to help you navigate financial difficulties. 
              This includes expense reduction strategies, payment prioritization, and resource recommendations.
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white focus-ring">
              Activate Emergency Mode
            </Button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Emergency Fund</h3>
          </div>
          <p className="text-2xl font-bold mb-1">$4,500</p>
          <p className="text-xs text-muted-foreground">3 months of expenses</p>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Quick Access</h3>
          </div>
          <p className="text-2xl font-bold mb-1">$1,200</p>
          <p className="text-xs text-muted-foreground">Immediately available</p>
        </GlassCard>

        <GlassCard hover>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Safety Net Score</h3>
          </div>
          <p className="text-2xl font-bold mb-1">7.5/10</p>
          <p className="text-xs text-muted-foreground">Good preparedness</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-6">What Emergency Mode Does</h3>
        <div className="space-y-4">
          {[
            {
              title: "Expense Analysis",
              description: "Identifies non-essential spending that can be paused or reduced immediately",
            },
            {
              title: "Payment Prioritization",
              description: "Creates a hierarchy of bills based on urgency and consequences",
            },
            {
              title: "Income Augmentation",
              description: "Suggests quick income opportunities and available assistance programs",
            },
            {
              title: "Debt Management",
              description: "Negotiates payment plans and explores consolidation options",
            },
            {
              title: "Recovery Timeline",
              description: "Builds a step-by-step plan to return to financial stability",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">{i + 1}</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
