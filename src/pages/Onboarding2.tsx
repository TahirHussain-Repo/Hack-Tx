import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Loader2, DollarSign, FileText, CreditCard } from "lucide-react";

const API_KEY = "87ad7bec4c2410f7f823e0f11da33b53";
const CUSTOMER_ID = "68f400d39683f20dd519ea94";

interface Deposit {
  amount: number;
  transaction_date: string;
}

interface Bill {
  payee: string;
  payment_amount: number;
  status: string;
}

const Onboarding2 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [yearlyIncome, setYearlyIncome] = useState(0);
  const [recentDeposits, setRecentDeposits] = useState<Deposit[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [subscriptions, setSubscriptions] = useState<{ name: string; amount: number }[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Fetch customer accounts
      const accountsResponse = await fetch(
        `http://api.nessieisreal.com/customers/${CUSTOMER_ID}/accounts?key=${API_KEY}`
      );
      const accounts = await accountsResponse.json();

      // Fetch deposits from all accounts
      let allDeposits: Deposit[] = [];
      for (const account of accounts) {
        const depositsResponse = await fetch(
          `http://api.nessieisreal.com/accounts/${account._id}/deposits?key=${API_KEY}`
        );
        const deposits = await depositsResponse.json();
        if (Array.isArray(deposits)) {
          allDeposits = [...allDeposits, ...deposits];
        }
      }

      // Sort deposits by date and get the two most recent
      const sortedDeposits = allDeposits
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
        .slice(0, 2);

      setRecentDeposits(sortedDeposits);

      // Calculate monthly income (assuming bi-monthly payments)
      if (sortedDeposits.length > 0) {
        const avgDeposit = sortedDeposits.reduce((sum, d) => sum + d.amount, 0) / sortedDeposits.length;
        const monthly = Math.round(avgDeposit * 2); // Two deposits per month
        setMonthlyIncome(monthly);
        setYearlyIncome(monthly * 12); // Calculate yearly
      }

      // Fetch bills
      const billsResponse = await fetch(
        `http://api.nessieisreal.com/customers/${CUSTOMER_ID}/bills?key=${API_KEY}`
      );
      const billsData = await billsResponse.json();
      
      if (Array.isArray(billsData)) {
        // Filter only active/recurring bills
        const activeBills = billsData.filter((b: Bill) => 
          b.status === "recurring" || b.status === "pending"
        );
        setBills(activeBills);

        // Separate subscriptions (typically smaller amounts)
        const subs = activeBills
          .filter((b: Bill) => b.payment_amount < 50)
          .map((b: Bill) => ({
            name: b.payee,
            amount: b.payment_amount
          }));
        setSubscriptions(subs);
      }

    } catch (error) {
      console.error("Error fetching financial data:", error);
      // Fallback to mock data if API fails
      const monthly = 8334;
      setMonthlyIncome(monthly);
      setYearlyIncome(monthly * 12);
      setRecentDeposits([
        { amount: 4167, transaction_date: "2025-10-31" },
        { amount: 4167, transaction_date: "2025-10-15" }
      ]);
      setBills([
        { payee: "Rent", payment_amount: 2200, status: "recurring" },
        { payee: "Utilities", payment_amount: 170, status: "recurring" },
        { payee: "Internet", payment_amount: 80, status: "recurring" },
        { payee: "Insurance", payment_amount: 110, status: "recurring" },
        { payee: "Credit Card", payment_amount: 600, status: "recurring" },
        { payee: "Student Loan", payment_amount: 210, status: "recurring" }
      ]);
      setSubscriptions([
        { name: "Spotify", amount: 17 },
        { name: "Netflix", amount: 16 },
        { name: "Paramount+", amount: 6 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-lg text-muted-foreground">Analyzing your finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card animate-fade-in">
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-white/[0.08]"></div>
        </div>

        <GlassCard className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
              📊 Here's what we found
            </h1>
          </div>

          {/* Income Section */}
          <GlassCard className="mb-6 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Income</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Monthly</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Yearly</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(yearlyIncome)}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Recent Deposits: {recentDeposits.map((d, i) => (
                <span key={i}>
                  {formatDate(d.transaction_date)} ({formatCurrency(d.amount)}){i < recentDeposits.length - 1 ? " & " : ""}
                </span>
              ))}
            </p>
          </GlassCard>

          {/* Monthly Bills Section */}
          {bills.length > 0 && (
            <GlassCard className="mb-6 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Monthly Bills</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {bills.filter(b => b.payment_amount >= 50).map((bill, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{bill.payee}</span>
                    <span className="text-sm font-semibold text-primary">{formatCurrency(bill.payment_amount)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Subscriptions Section */}
          {subscriptions.length > 0 && (
            <GlassCard className="mb-8 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/20">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Subscriptions</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {subscriptions.map((sub, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20"
                  >
                    <span className="text-sm font-medium text-foreground">{sub.name}</span>
                    <span className="text-sm font-semibold text-accent">{formatCurrency(sub.amount)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Confirmation Section */}
          <GlassCard className="mb-6 p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-3">
              <input
                id="confirm-data"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-accent/30 bg-white/[0.03] text-accent focus:ring-2 focus:ring-accent cursor-pointer"
              />
              <label htmlFor="confirm-data" className="text-sm text-foreground cursor-pointer">
                I confirm that this financial information is accurate and I'm ready to create my personalized money plan.
              </label>
            </div>
          </GlassCard>

          {/* CTA */}
          <Button 
            onClick={() => navigate("/onboarding/3")}
            disabled={!confirmed}
            className="w-full py-6 text-lg font-semibold gradient-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};

export default Onboarding2;
