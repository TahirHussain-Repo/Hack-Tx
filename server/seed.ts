import "dotenv/config";
import axios from "axios";
import { z } from "zod";

const NESSIE_BASE = process.env.NESSIE_BASE || "https://api.nessieisreal.com";
const NESSIE_KEY = process.env.NESSIE_KEY;
const ACCOUNT_ID = process.argv[2] || process.env.ACCOUNT_ID;

if (!NESSIE_KEY) {
  throw new Error("NESSIE_KEY is required");
}

if (!ACCOUNT_ID) {
  throw new Error("Provide an account id as argv[2] or ACCOUNT_ID env var");
}

const client = axios.create({
  baseURL: NESSIE_BASE,
  params: { key: NESSIE_KEY },
});

const purchaseSchema = z.object({
  merchant_id: z.string(),
  medium: z.literal("balance"),
  purchase_date: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const depositSchema = z.object({
  medium: z.literal("balance"),
  transaction_date: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

async function main() {
  console.log(`Seeding account ${ACCOUNT_ID}`);

  const depositPayload = depositSchema.parse({
    medium: "balance",
    transaction_date: new Date().toISOString().slice(0, 10),
    amount: 50,
    description: "HackTx seed deposit",
  });
  const purchasePayload = purchaseSchema.parse({
    merchant_id: "57cf75cea73e494d8675ec49",
    medium: "balance",
    purchase_date: new Date().toISOString().slice(0, 10),
    amount: 10,
    description: "HackTx seed purchase",
  });

  const deposit = await client.post(`/accounts/${ACCOUNT_ID}/deposits`, depositPayload);
  console.log("Created deposit", deposit.data);

  const purchase = await client.post(`/accounts/${ACCOUNT_ID}/purchases`, purchasePayload);
  console.log("Created purchase", purchase.data);
}

main().catch((err) => {
  console.error(err.response?.data ?? err);
  process.exit(1);
});
