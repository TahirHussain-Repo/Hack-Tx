import { useState } from "react";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { VoiceWaveform } from "@/components/VoiceWaveform";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { MicControl } from "@/components/MicControl";
import { SessionControls } from "@/components/SessionControls";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target, Clock } from "lucide-react";
import { useFinancialData } from "@/contexts/FinancialDataContext";

type SessionState = "idle" | "active" | "paused";
type MicState = "idle" | "listening" | "processing";

interface TranscriptMessage {
  id: string;
  role: "user" | "advisor";
  content: string;
  timestamp: Date;
}

export default function AdvisorCall() {
  const { data } = useFinancialData();
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [micState, setMicState] = useState<MicState>("idle");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  // Calculate real data from context
  const totalSpending = data.bills.reduce((sum, bill) => sum + bill.payment_amount, 0);
  const savingsRate = data.financialPlan?.savingsPercentage || 0;
  const activeGoals = data.goals.length;
  const nearestGoal = data.goals.length > 0 
    ? data.goals.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0]
    : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStartSession = () => {
    setSessionState("active");
    // Add welcome message
    setMessages([
      {
        id: "1",
        role: "advisor",
        content: "Hello! I'm your MoneyTalks advisor. I've reviewed your recent financial activity. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleEndSession = () => {
    setSessionState("idle");
    setMicState("idle");
    setMessages([]);
  };

  const handleMicToggle = () => {
    if (sessionState !== "active") return;

    if (micState === "idle") {
      setMicState("listening");
      
      // Simulate voice detection after 2 seconds
      setTimeout(() => {
        setMicState("processing");
        
        // Simulate processing and response
        setTimeout(() => {
          const userMessage: TranscriptMessage = {
            id: Date.now().toString(),
            role: "user",
            content: "How am I doing with my budget this month?",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, userMessage]);
          setMicState("idle");
          
          // Add advisor response
          setTimeout(() => {
            const advisorMessage: TranscriptMessage = {
              id: (Date.now() + 1).toString(),
              role: "advisor",
              content: "You're doing great! You've spent $3,247 of your $3,750 budget, which is 87% utilization. Your spending is down 12% from last month, and your savings rate increased to 32%.",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, advisorMessage]);
          }, 1000);
        }, 1500);
      }, 2000);
    } else if (micState === "listening") {
      setMicState("idle");
    }
  };

  const handleGenerateGoals = () => {
    // Mock goal generation
    setMessages([
      {
        id: "goal-1",
        role: "advisor",
        content: "Based on your spending patterns, I recommend three goals: Build a 6-month emergency fund ($15,000), Save for your Paris trip ($5,000 by June 2026), and Invest 15% of income for retirement.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="animate-fade-in-up max-w-7xl mx-auto">
      <Header
        title="Advisor Call"
        subtitle="Voice-first financial guidance powered by AI"
      />

      {/* Session Status Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge
            variant={sessionState === "active" ? "default" : "secondary"}
            className={
              sessionState === "active"
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-muted/20 text-muted-foreground border-muted/30"
            }
          >
            {sessionState === "active" ? "Session Active" : "Ready to Start"}
          </Badge>
          {sessionState === "active" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Session started</span>
            </div>
          )}
        </div>

        {sessionState === "active" && (
          <MicControl
            state={micState}
            onToggle={handleMicToggle}
            size="default"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Voice Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waveform Visualization */}
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {sessionState === "active"
                    ? micState === "listening"
                      ? "Listening..."
                      : micState === "processing"
                      ? "Processing..."
                      : "Speak when ready"
                    : "Start a Session"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {sessionState === "active"
                    ? "Click the mic to speak or ask questions"
                    : "Begin your personalized financial consultation"}
                </p>
              </div>

              <VoiceWaveform
                isActive={sessionState === "active" && micState === "listening"}
                bars={40}
              />

              {sessionState === "idle" && (
                <div className="flex justify-center mt-6">
                  <MicControl
                    state="idle"
                    onToggle={() => {}}
                    size="lg"
                  />
                </div>
              )}
            </div>
          </GlassCard>

          {/* Session Controls */}
          <div className="flex justify-center">
            <SessionControls
              state={sessionState}
              onStart={handleStartSession}
              onEnd={handleEndSession}
              onGenerateGoals={sessionState === "idle" ? handleGenerateGoals : undefined}
            />
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-4">
          <GlassCard hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Bills</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpending)}</p>
              </div>
            </div>
            {totalSpending > 0 && data.financialPlan && (
              <p className="text-xs text-muted-foreground">
                {((totalSpending / data.financialPlan.monthlyIncome) * 100).toFixed(1)}% of monthly income
              </p>
            )}
          </GlassCard>

          <GlassCard hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-xl font-bold text-foreground">{savingsRate}%</p>
              </div>
            </div>
            {data.financialPlan && (
              <p className="text-xs text-primary">
                {formatCurrency(Math.round((data.financialPlan.monthlyIncome * savingsRate) / 100))}/month
              </p>
            )}
          </GlassCard>

          <GlassCard hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-xl font-bold text-foreground">{activeGoals}</p>
              </div>
            </div>
            {nearestGoal && (
              <p className="text-xs text-muted-foreground">
                Next: {nearestGoal.name} by {new Date(nearestGoal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Live Transcript */}
      <TranscriptPanel
        messages={messages}
        isLive={sessionState === "active"}
        className="p-6"
      />
    </div>
  );
}

