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
      content: "Hi Alex! I'm your MoneyTalks advisor. How can I help you with your finances today?",
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
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.role === "assistant" && (
                  <button className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    Listen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="glass-card-hover shrink-0">
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your spending, savings, or goals..."
            className="flex-1 glass-card border-white/10 focus:border-primary/50"
          />
          <Button onClick={handleSend} className="gradient-primary shrink-0 hover:opacity-90">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
