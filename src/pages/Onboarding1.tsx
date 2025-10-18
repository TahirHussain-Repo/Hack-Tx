import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { CheckCircle2, Loader2, Building2 } from "lucide-react";

const Onboarding1 = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"login" | "connecting" | "connected">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fake connecting animation
    setStep("connecting");
    
    // Simulate API connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep("connected");
  };

  const handleContinue = () => {
    navigate("/onboarding/2");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-white/[0.08]"></div>
          <div className="h-1 flex-1 rounded-full bg-white/[0.08]"></div>
        </div>

        <GlassCard className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              👋 Welcome to MoneyTalks
            </h1>
            <p className="text-xl font-semibold text-foreground/80">
              your personal CFO
            </p>
            <p className="text-muted-foreground mt-4">
              We'll connect to your bank, analyze your accounts, and build your financial plan.
            </p>
          </div>

          {step === "login" && (
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Capital One Integration</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your Capital One credentials to connect your accounts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="mt-2 bg-white/[0.03] border-white/[0.08]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-2 bg-white/[0.03] border-white/[0.08]"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full py-6 text-lg font-semibold gradient-primary hover:opacity-90"
              >
                Connect Account →
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Your credentials are encrypted and secure
              </p>
            </form>
          )}

          {step === "connecting" && (
            <div className="py-12 text-center space-y-6">
              <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Connecting to Capital One
                </h3>
                <p className="text-muted-foreground">
                  Securely accessing your accounts...
                </p>
              </div>
              <div className="space-y-3 max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-sm text-muted-foreground animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Verifying credentials</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }}>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Fetching account data</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground animate-pulse" style={{ animationDelay: "0.4s" }}>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Analyzing transactions</span>
                </div>
              </div>
            </div>
          )}

          {step === "connected" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Successfully Connected!
                </h3>
                <p className="text-muted-foreground">
                  We've securely linked your Capital One accounts
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    Connected: Checking, Savings, Credit Card
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    Verified Credit Score: 742
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full py-6 text-lg font-semibold gradient-primary hover:opacity-90"
              >
                Continue →
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Onboarding1;
