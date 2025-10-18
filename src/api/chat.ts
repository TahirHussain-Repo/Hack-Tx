const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5179/api";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  context?: {
    accountSummary?: string;
    goals?: string;
  };
};

export type ChatResponse = {
  message: string;
};

function json<T>(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, init).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json() as Promise<T>;
  });
}

export const ChatAPI = {
  complete(body: ChatRequest) {
    return json<ChatResponse>(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },
};
