import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import axios, { AxiosError, Method } from "axios";
import cors from "cors";
import morgan from "morgan";
import { z } from "zod";

const PORT = Number(process.env.PORT) || 5179;
const NESSIE_BASE = process.env.NESSIE_BASE || "https://api.nessieisreal.com";
const NESSIE_KEY = process.env.NESSIE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

if (!NESSIE_KEY) {
  console.warn("[nessie-proxy] Warning: NESSIE_KEY is not set. Requests will fail against Nessie API.");
}

const app = express();

const allowedOrigins = CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);

allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      try {
        const url = new URL(origin);
        if (
          url.hostname === "localhost" ||
          url.hostname === "127.0.0.1" ||
          url.hostname === "[::1]"
        ) {
          return callback(null, true);
        }
      } catch (err) {
        // ignore malformed origins
      }

      console.warn(`[cors] blocked origin ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

const axiosClient = axios.create({
  baseURL: NESSIE_BASE,
  timeout: 15_000,
});

const GEMINI_MODEL_NAME = GEMINI_MODEL.startsWith("models/") ? GEMINI_MODEL : `models/${GEMINI_MODEL}`;
const GEMINI_FALLBACK_MODEL = "models/gemini-2.0-flash";

const VITE_PORT = Number(process.env.VITE_PORT) || 5173;

type ForwardOptions = {
  params?: Record<string, unknown>;
  data?: unknown;
};

async function forward<T>(method: Method, path: string, opts: ForwardOptions = {}) {
  if (!NESSIE_KEY) {
    throw new Error("NESSIE_KEY is not configured");
  }
  const queryParams: Record<string, unknown> = {
    ...(opts.params ?? {}),
    key: NESSIE_KEY,
  };

  const result = await axiosClient.request<T>({
    method,
    url: path,
    params: queryParams,
    data: opts.data,
  });

  return result.data;
}

const purchaseSchema = z.object({
  merchant_id: z.string().min(1),
  medium: z.enum(["balance", "rewards"]),
  purchase_date: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const depositSchema = z.object({
  medium: z.literal("balance"),
  transaction_date: z.string().min(1),
  amount: z.number().nonnegative(),
  description: z.string().optional(),
});

const billSchema = z.object({
  status: z.enum(["pending", "cancelled", "completed"]),
  payee: z.string().min(1),
  nickname: z.string().optional(),
  payment_date: z.string().min(1),
  recurring_date: z.number().int().min(1).max(31).optional(),
  payment_amount: z.number().nonnegative(),
});

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    }),
  ),
  context: z
    .object({
      accountSummary: z.string().optional(),
      goals: z.string().optional(),
    })
    .optional(),
});

function asyncHandler<Req extends Request, Res extends Response>(fn: (req: Req, res: Res) => Promise<unknown>) {
  return (req: Req, res: Res, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/customers",
  asyncHandler(async (_req, res) => {
    const data = await forward("GET", "/customers");
    res.json(data);
  }),
);

async function callGemini(messages: { role: string; content: string }[], context?: { accountSummary?: string; goals?: string }) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const systemPrompt =
    "You are MoneyTalks, a helpful personal finance AI that gives concise, actionable advice. " +
    "Answer using clear paragraphs, cite figures in USD, and reference spending trends only if mentioned.";

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    ...messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  ];

  if (context?.accountSummary) {
    contents.push({ role: "user", parts: [{ text: `Account summary: ${context.accountSummary}` }] });
  }
  if (context?.goals) {
    contents.push({ role: "user", parts: [{ text: `Goals: ${context.goals}` }] });
  }

  type GeminiResponse = {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const doCall = async (model: string): Promise<GeminiResponse> => {
    const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    return (await response.json()) as GeminiResponse;
  };

  let json: GeminiResponse;
  try {
    json = await doCall(GEMINI_MODEL_NAME);
  } catch (err) {
    console.warn(`[gemini] primary model ${GEMINI_MODEL_NAME} failed, trying fallback`);
    json = await doCall(GEMINI_FALLBACK_MODEL);
  }

  const text = json?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}

app.get(
  "/api/accounts",
  asyncHandler(async (_req, res) => {
    const data = await forward("GET", "/accounts");
    res.json(data);
  }),
);

app.get(
  "/api/accounts/:accountId",
  asyncHandler(async (req, res) => {
    const data = await forward("GET", `/accounts/${req.params.accountId}`);
    res.json(data);
  }),
);

app.get(
  "/api/accounts/:accountId/purchases",
  asyncHandler(async (req, res) => {
    const data = await forward("GET", `/accounts/${req.params.accountId}/purchases`);
    res.json(data);
  }),
);

app.post(
  "/api/accounts/:accountId/purchases",
  asyncHandler(async (req, res) => {
    const body = purchaseSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid purchase payload", details: body.error.flatten() });
      return;
    }
    const data = await forward("POST", `/accounts/${req.params.accountId}/purchases`, { data: body.data });
    res.status(201).json(data);
  }),
);

app.get(
  "/api/accounts/:accountId/deposits",
  asyncHandler(async (req, res) => {
    const data = await forward("GET", `/accounts/${req.params.accountId}/deposits`);
    res.json(data);
  }),
);

app.post(
  "/api/accounts/:accountId/deposits",
  asyncHandler(async (req, res) => {
    const body = depositSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid deposit payload", details: body.error.flatten() });
      return;
    }
    const data = await forward("POST", `/accounts/${req.params.accountId}/deposits`, { data: body.data });
    res.status(201).json(data);
  }),
);

app.get(
  "/api/accounts/:accountId/bills",
  asyncHandler(async (req, res) => {
    const data = await forward("GET", `/accounts/${req.params.accountId}/bills`);
    res.json(data);
  }),
);

app.post(
  "/api/accounts/:accountId/bills",
  asyncHandler(async (req, res) => {
    const body = billSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid bill payload", details: body.error.flatten() });
      return;
    }
    const data = await forward("POST", `/accounts/${req.params.accountId}/bills`, { data: body.data });
    res.status(201).json(data);
  }),
);

app.post(
  "/api/chat/completions",
  asyncHandler(async (req, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid chat payload", details: parsed.error.flatten() });
      return;
    }

    const { messages, context } = parsed.data;
    try {
      const text = await callGemini(messages, context);
      res.json({ message: text });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error("[gemini]", error);
      res.status(500).json({ error: "Gemini request failed", details: error });
    }
  }),
);

app.get(
  "/api/merchants",
  asyncHandler(async (_req, res) => {
    const data = await forward("GET", "/merchants");
    res.json(data);
  }),
);

app.get(
  "/api/branches",
  asyncHandler(async (_req, res) => {
    const data = await forward("GET", "/branches");
    res.json(data);
  }),
);

app.get(
  "/api/atms",
  asyncHandler(async (_req, res) => {
    const data = await forward("GET", "/atms");
    res.json(data);
  }),
);

app.use((err: Error | AxiosError, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[nessie-proxy]", err);
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 500;
    return res.status(status).json({
      error: "Upstream request failed",
      status,
      details: err.response?.data ?? err.message,
    });
  }
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[nessie-proxy] Listening on http://localhost:${PORT}`);
});

