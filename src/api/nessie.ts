const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5179/api";

export type Account = {
  _id: string;
  type: string;
  nickname?: string;
  balance: number;
  rewards?: number;
  customer_id: string;
};

export type Purchase = {
  _id?: string;
  merchant_id: string;
  medium: "balance" | "rewards";
  purchase_date: string;
  amount: number;
  description?: string;
};

export type Deposit = {
  _id?: string;
  medium: "balance";
  transaction_date: string;
  amount: number;
  description?: string;
};

export type Bill = {
  _id?: string;
  status: "pending" | "cancelled" | "completed";
  payee: string;
  nickname?: string;
  payment_date: string;
  recurring_date?: number;
  payment_amount: number;
};

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || res.statusText);
  }
  return res.json() as Promise<T>;
}

const json = <T>(path: string, init?: RequestInit) =>
  fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  }).then(j<T>);

// Public dataset types are loosely typed due to varying schema in Nessie sandbox.
// Consumers can refine these as needed.
type Customer = Record<string, unknown>;
type Merchant = Record<string, unknown>;
type Branch = Record<string, unknown>;
type ATM = Record<string, unknown>;

export const Nessie = {
  health: () => json<{ ok: boolean }>("/health"),
  customers: () => json<Customer[]>("/customers"),
  accounts: () => json<Account[]>("/accounts"),
  account: (id: string) => json<Account>(`/accounts/${id}`),
  purchases: (accountId: string) => json<Purchase[]>(`/accounts/${accountId}/purchases`),
  createPurchase: (accountId: string, payload: Purchase) =>
    json<Purchase>(`/accounts/${accountId}/purchases`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deposits: (accountId: string) => json<Deposit[]>(`/accounts/${accountId}/deposits`),
  createDeposit: (accountId: string, payload: Deposit) =>
    json<Deposit>(`/accounts/${accountId}/deposits`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  bills: (accountId: string) => json<Bill[]>(`/accounts/${accountId}/bills`),
  createBill: (accountId: string, payload: Bill) =>
    json<Bill>(`/accounts/${accountId}/bills`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  branches: () => json<Branch[]>("/branches"),
  atms: () => json<ATM[]>("/atms"),
  merchants: () => json<Merchant[]>("/merchants"),
};

export type NessieClient = typeof Nessie;
