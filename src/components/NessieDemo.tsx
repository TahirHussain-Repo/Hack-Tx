import { useEffect, useState, type FormEvent } from "react";
import { Nessie, type Account, type Purchase, type Deposit, type Bill } from "@/api/nessie";
import { useNessie } from "@/hooks/use-nessie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/GlassCard";
import { todayISO } from "@/utils/dates";

export function NessieDemo() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const { run, loading, error } = useNessie();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [merchantsCount, setMerchantsCount] = useState<number | null>(null);
  const [branchesCount, setBranchesCount] = useState<number | null>(null);
  const [atmsCount, setAtmsCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadAccounts = async () => {
      try {
        setAccountsLoading(true);
        setAccountsError(null);
        const list = await Nessie.accounts();
        if (!active) return;
        setAccounts(list);
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : String(err);
        setAccountsError(msg);
      } finally {
        if (active) setAccountsLoading(false);
      }
    };

    loadAccounts();
    return () => {
      active = false;
    };
  }, []);

  const loadAccountData = async (accountId: string) => {
    const [p, d, b] = await Promise.all([
      Nessie.purchases(accountId),
      Nessie.deposits(accountId),
      Nessie.bills(accountId),
    ]);
    setPurchases(p);
    setDeposits(d);
    setBills(b);
  };

  const handleSelect = async (account: Account) => {
    setSelectedAccount(account);
    await loadAccountData(account._id);
  };

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccount) return;
    const form = new FormData(event.currentTarget);
    const payload: Deposit = {
      medium: "balance",
      transaction_date: form.get("transaction_date") as string,
      amount: Number(form.get("amount")) || 0,
      description: String(form.get("description") || ""),
    };
    const result = await run(() => Nessie.createDeposit(selectedAccount._id, payload));
    if (result) {
      setMessage("Deposit created");
      await loadAccountData(selectedAccount._id);
      event.currentTarget.reset();
    }
  };

  const handlePurchase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccount) return;
    const form = new FormData(event.currentTarget);
    const payload: Purchase = {
      merchant_id: String(form.get("merchant_id") || ""),
      medium: (form.get("medium") as Purchase["medium"]) || "balance",
      purchase_date: form.get("purchase_date") as string,
      amount: Number(form.get("amount")) || 0,
      description: String(form.get("description") || ""),
    };
    const result = await run(() => Nessie.createPurchase(selectedAccount._id, payload));
    if (result) {
      setMessage("Purchase created");
      await loadAccountData(selectedAccount._id);
      event.currentTarget.reset();
    }
  };

  const handleBill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccount) return;
    const form = new FormData(event.currentTarget);
    const payload: Bill = {
      payee: String(form.get("payee") || ""),
      status: (form.get("status") as Bill["status"]) || "pending",
      payment_date: form.get("payment_date") as string,
      payment_amount: Number(form.get("payment_amount")) || 0,
      nickname: String(form.get("nickname") || ""),
      recurring_date: form.get("recurring_date") ? Number(form.get("recurring_date")) : undefined,
    };
    const result = await run(() => Nessie.createBill(selectedAccount._id, payload));
    if (result) {
      setMessage("Bill created");
      await loadAccountData(selectedAccount._id);
      event.currentTarget.reset();
    }
  };

  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  useEffect(() => {
    let active = true;
    const loadPublicData = async () => {
      try {
        const [merchants, branches, atms] = await Promise.all([
          Nessie.merchants(),
          Nessie.branches(),
          Nessie.atms(),
        ]);
        if (!active) return;
        setMerchantsCount(merchants.length);
        setBranchesCount(branches.length);
        setAtmsCount(atms.length);
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : String(err);
        setMessage(msg);
      }
    };

    loadPublicData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Nessie Demo</h2>
      <p className="text-sm text-muted-foreground">
        Use this sandbox to validate the Nessie proxy integration. All requests go through the Express server.
      </p>

      {message && (
        <div className="rounded-md bg-primary/10 border border-primary/20 p-3 text-sm text-primary">{message}</div>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Accounts</h3>
        {accountsLoading && <p>Loading accounts...</p>}
        {accountsError && <p className="text-destructive">{accountsError}</p>}
        <div className="flex gap-2 flex-wrap">
          {accounts.map((account) => (
            <Button
              key={account._id}
              variant={selectedAccount?._id === account._id ? "default" : "outline"}
              onClick={() => handleSelect(account)}
            >
              {account.nickname || account.type} (${account.balance.toFixed(2)})
            </Button>
          ))}
        </div>
      </section>

      {selectedAccount && (
        <section className="grid gap-6 md:grid-cols-2">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Create Deposit</h3>
            <form onSubmit={handleDeposit} className="space-y-3">
              <Input name="transaction_date" type="date" defaultValue={todayISO()} required />
              <Input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
              <Input name="description" placeholder="Description" />
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Deposit"}
              </Button>
            </form>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Create Purchase</h3>
            <form onSubmit={handlePurchase} className="space-y-3">
              <Input name="merchant_id" placeholder="Merchant ID" required />
              <Input name="medium" placeholder="Medium (balance | rewards)" defaultValue="balance" required />
              <Input name="purchase_date" type="date" defaultValue={todayISO()} required />
              <Input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
              <Input name="description" placeholder="Description" />
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Purchase"}
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Create Bill</h3>
            <form onSubmit={handleBill} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input name="payee" placeholder="Payee" required />
                <Input name="nickname" placeholder="Nickname" />
                <Input name="status" placeholder="Status" defaultValue="pending" required />
                <Input name="payment_date" type="date" defaultValue={todayISO()} required />
                <Input name="recurring_date" type="number" min="1" max="31" placeholder="Recurring day" />
                <Input name="payment_amount" type="number" min="0" step="0.01" placeholder="Amount" required />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Bill"}
              </Button>
            </form>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Purchases</h3>
            <ul className="space-y-2 max-h-60 overflow-auto text-sm">
              {purchases.map((purchase) => (
                <li key={purchase._id || `${purchase.merchant_id}-${purchase.purchase_date}-${purchase.amount}`} className="rounded border border-white/10 p-2">
                  <div className="flex justify-between">
                    <span>{purchase.description || purchase.merchant_id}</span>
                    <span>${purchase.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{purchase.purchase_date}</p>
                </li>
              ))}
              {purchases.length === 0 && <p>No purchases yet.</p>}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Deposits</h3>
            <ul className="space-y-2 max-h-60 overflow-auto text-sm">
              {deposits.map((deposit) => (
                <li key={deposit._id || `${deposit.transaction_date}-${deposit.amount}`} className="rounded border border-white/10 p-2">
                  <div className="flex justify-between">
                    <span>{deposit.description || "Deposit"}</span>
                    <span>${deposit.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{deposit.transaction_date}</p>
                </li>
              ))}
              {deposits.length === 0 && <p>No deposits yet.</p>}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Bills</h3>
            <ul className="space-y-2 max-h-60 overflow-auto text-sm">
              {bills.map((bill) => (
                <li key={bill._id || `${bill.payee}-${bill.payment_date}-${bill.payment_amount}`} className="rounded border border-white/10 p-2">
                  <div className="flex justify-between">
                    <span>{bill.payee}</span>
                    <span className="text-sm">${bill.payment_amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{bill.payment_date} • {bill.status}</p>
                </li>
              ))}
              {bills.length === 0 && <p>No bills yet.</p>}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Public Data</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Branches, ATMs, Merchants are fetched via proxy.
            </p>
            <div className="space-y-1 text-sm">
              <p>Merchants loaded: {merchantsCount ?? "..."}</p>
              <p>Branches loaded: {branchesCount ?? "..."}</p>
              <p>ATMs loaded: {atmsCount ?? "..."}</p>
            </div>
          </GlassCard>
        </section>
      )}
    </div>
  );
}
