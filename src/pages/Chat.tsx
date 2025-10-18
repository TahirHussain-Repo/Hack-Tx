import { useState } from "react";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { Send, Mic, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello. I'm your MoneyTalks advisor. How can I assist you with your finances today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you're interested in that. Let me analyze your spending patterns and get back to you with personalized insights.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <Header title="Chat Advisor" subtitle="Ask me anything about your finances" />

      <GlassCard className="flex-1 flex flex-col mb-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary/10 border border-primary/20 text-foreground"
                    : "bg-white/[0.03] border border-white/[0.08] text-foreground"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary">AI Advisor</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.role === "assistant" && (
                  <button className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors focus-ring">
                    <Volume2 className="h-3 w-3" />
                    Listen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="glass-card-hover shrink-0 focus-ring">
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your spending, savings, or goals..."
            className="flex-1 glass-card border-white/[0.08] focus:border-primary/50 focus-ring"
          />
          <Button onClick={handleSend} className="gradient-primary text-primary-foreground shrink-0 hover:opacity-90 focus-ring">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
