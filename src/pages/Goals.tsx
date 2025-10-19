import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Target, TrendingUp, Calendar, Plus, Car, Star, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useEffect, useMemo, useState } from "react";

export default function Goals() {
  const { data } = useFinancialData();
  const { goals } = data;

  // --- Simulated Computer Use Search State ---
  type CarRec = {
    title: string;
    price: string;
    rating: number;
    image: string;
    features: string[];
    link: string;
  };

  const [isSearching, setIsSearching] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<CarRec[] | null>(null);

  const searchSteps = [
    "Alright, let me look around for you...",
    "Checking out Toyota listings...",
    "Found some options! Let me grab the details...",
    "Filtering by best value and ratings...",
    "Almost there, just organizing everything...",
    "Got it! Here's what I found...",
  ];

  // No screenshots displayed; keep the flow minimal and focused

  const simulatedResults: CarRec[] = useMemo(() => ([
    {
      title: "2019 Toyota Corolla LE (Used)",
      price: "$15,200",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1549921296-3b4a4f1468a0?q=80&w=1200&auto=format&fit=crop",
      features: ["45k–65k mi", "30/38 MPG", "Apple CarPlay"],
      link: "https://www.google.com/search?q=2019+Toyota+Corolla+LE+for+sale",
    },
    {
      title: "2018 Toyota Camry SE (Used)",
      price: "$17,500",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop",
      features: ["60k–80k mi", "28/39 MPG", "Safety Sense"],
      link: "https://www.google.com/search?q=2018+Toyota+Camry+SE+for+sale",
    },
    {
      title: "2020 Toyota RAV4 XLE (Used)",
      price: "$23,900",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1200&auto=format&fit=crop",
      features: ["35k–60k mi", "AWD options", "Great resale"],
      link: "https://www.google.com/search?q=2020+Toyota+RAV4+XLE+for+sale",
    },
    {
      title: "2021 Toyota Prius L Eco (Used)",
      price: "$21,400",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop",
      features: ["40k–70k mi", "53/58 MPG", "Low running costs"],
      link: "https://www.google.com/search?q=2021+Toyota+Prius+L+Eco+for+sale",
    },
    {
      title: "2022 Toyota Corolla Hybrid LE (Used/New)",
      price: "$24,800",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1542367588-3ef8a6c2d6b0?q=80&w=1200&auto=format&fit=crop",
      features: ["Hybrid MPG", "Modern safety tech", "Daily driver"],
      link: "https://www.google.com/search?q=2022+Toyota+Corolla+Hybrid+LE+for+sale",
    },
  ]), []);

  const startSimulatedSearch = () => {
    setResults(null);
    setIsSearching(true);
    setStepIndex(0);
  };

  useEffect(() => {
    if (!isSearching) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setStepIndex(i);
      if (i >= searchSteps.length - 1) {
        clearInterval(interval);
        // brief pause to mimic finalization
        setTimeout(() => {
          setIsSearching(false);
          setResults(simulatedResults);
        }, 800);
      }
    }, 1100);
    return () => clearInterval(interval);
  }, [isSearching, searchSteps.length, simulatedResults]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (goals.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <Header title="Goals" subtitle="Track your financial milestones" />
        <GlassCard className="text-center p-12">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Goals Set Yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete the onboarding process to set your financial goals.
          </p>
          <Button className="gradient-primary text-primary-foreground hover:opacity-90 focus-ring">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <Header title="Goals" subtitle="Track your financial milestones" />
        <Button className="gradient-primary text-primary-foreground hover:opacity-90 focus-ring">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Toyota Recommendations (Simulated Computer Use) */}
      <GlassCard className="p-6 mb-8 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-blue-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Car className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Find Toyota cars within your budget</h3>
              <p className="text-sm text-muted-foreground">I'll search around and find you some solid Toyota options that fit your goals.</p>
            </div>
          </div>
        </div>

        {!isSearching && !results && (
          <Button className="gradient-primary" onClick={startSimulatedSearch}>
            Find me some cars 🚗
          </Button>
        )}

        {isSearching && (
          <div className="">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <span className="text-sm text-muted-foreground">{searchSteps[Math.min(stepIndex, searchSteps.length - 1)]}</span>
            </div>
            <Progress value={((stepIndex + 1) / searchSteps.length) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Hang tight, this takes about 6 seconds</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Here are {results.length} solid picks I found for you 👍</div>
              <Button variant="outline" size="sm" onClick={startSimulatedSearch}>Search again</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((car) => (
                <div key={car.title} className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{car.title}</h4>
                      <span className="text-sm font-bold text-green-400">{car.price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-yellow-400 mb-2">
                      <Star className="h-3 w-3" /><span>{car.rating.toFixed(1)}</span><span className="text-muted-foreground">rating</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {car.features.map((f) => (
                        <span key={f} className="px-2 py-1 rounded-full text-[11px] bg-white/[0.04] border border-white/[0.08] text-muted-foreground">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end">
                      <a href={car.link} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline">View Listing</Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const current = goal.currentAmount || 0;
          const progress = (current / goal.amount) * 100;
          const remaining = goal.amount - current;

          return (
            <GlassCard key={goal.id} hover className="group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {goal.emoji} {formatDate(goal.targetDate)}
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>

              <Progress value={progress} className="h-2 mb-4" />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(current)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(goal.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(goal.targetDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <TrendingUp className="h-4 w-4" />
                  {formatCurrency(remaining)} to go
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                <p className="text-xs text-muted-foreground">
                  Allocating: {formatCurrency(goal.monthlyAllocation)}/month
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
