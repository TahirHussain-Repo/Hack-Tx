import { useEffect } from "react";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockAIInsights } from "@/lib/mockData";

interface AdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvisorDrawer = ({ isOpen, onClose }: AdvisorDrawerProps) => {
  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-background border-l border-white/[0.08] z-50 animate-slide-in-right overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 id="advisor-title" className="text-lg font-semibold text-foreground">AI Advisor</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="focus-ring"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Context-aware financial insights
          </p>
        </div>

        {/* Insights */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-start gap-3 mb-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Quick Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Based on your current page and recent activity, here are personalized insights.
                </p>
              </div>
            </div>
          </div>

          {mockAIInsights.map((insight, index) => (
            <div key={index} className="glass-card p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {insight.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  insight.confidence === "High" 
                    ? "bg-primary/20 text-primary" 
                    : "bg-accent/20 text-accent"
                }`}>
                  {insight.confidence}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {insight.description}
              </p>
              <Button size="sm" variant="ghost" className="w-full focus-ring">
                Learn More
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <Button className="w-full gradient-primary text-primary-foreground focus-ring">
            Start Advisor Session
          </Button>
          <Button variant="ghost" className="w-full focus-ring">
            View Full Report
          </Button>
        </div>
      </div>
    </>
  );
};

