import { useState, useRef, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Send, Mic, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatAPI, type ChatMessage } from "@/api/chat";
import { useNessie } from "@/hooks/use-nessie";

type ConversationMessage = ChatMessage & { id: string };

export default function Chat() {
  const [messages, setMessages] = useState<ConversationMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Hi Alex! I'm your MoneyTalks advisor. How can I help you with your finances today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { run, loading, error } = useNessie();
  const [displayError, setDisplayError] = useState<string | null>(null);

  const context = useMemo(
    () => ({
      accountSummary: "Checking: $2400, Savings: $5000, Credit Card: $1200",
      goals: "Trip to Paris: 68% ($3400/$5000), Emergency Fund: 45% ($4500/$10000)",
    }),
    [],
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading, displayError]);

  useEffect(() => {
    if (error) {
      setDisplayError(`Sorry, I couldn't reach the AI advisor. ${error}`);
    } else {
      setDisplayError(null);
    }
  }, [error]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setDisplayError(null);

    const payloadMessages: ChatMessage[] = [...messages, userMessage].map(({ role, content }) => ({ role, content }));

    const response = await run(() => ChatAPI.complete({ messages: payloadMessages, context }));
    if (!response?.message) {
      setDisplayError("Sorry, I couldn't get a response from the AI advisor.");
      return;
    }

    const reply = response.message.trim();
    if (!reply) {
      setDisplayError("Sorry, the AI advisor sent an empty reply.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Header title="Chat Advisor" subtitle="Ask me anything about your finances" />

      <GlassCard className="flex-1 flex flex-col mb-6 overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/30 text-foreground"
                    : "bg-white/5 border border-white/10 text-foreground"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold">
                      MT
                    </div>
                    <span className="text-xs text-muted-foreground">AI Advisor</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                {message.role === "assistant" && (
                  <button className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    Listen
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold">
                    MT
                  </div>
                  <span className="text-xs text-muted-foreground">AI Advisor</span>
                </div>
                <p className="text-sm leading-relaxed">Thinking...</p>
              </div>
            </div>
          )}
          {displayError && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-destructive/20 border border-destructive/30 text-destructive">
                <p className="text-sm leading-relaxed">{displayError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="glass-card-hover shrink-0" disabled={loading}>
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your spending, savings, or goals..."
            className="flex-1 glass-card border-white/10 focus:border-primary/50"
            disabled={loading}
          />
          <Button onClick={handleSend} className="gradient-primary shrink-0 hover:opacity-90" disabled={loading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
