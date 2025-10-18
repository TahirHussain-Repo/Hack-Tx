import { useEffect, useRef } from "react";
import { MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptMessage {
  id: string;
  role: "user" | "advisor";
  content: string;
  timestamp: Date;
}

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  isLive?: boolean;
  className?: string;
}

export const TranscriptPanel = ({ messages, isLive, className }: TranscriptPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (messages.length === 0) {
    return (
      <div className={cn("glass-card flex items-center justify-center min-h-[200px]", className)}>
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Start a session to begin your conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-card", className)}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Live Transcript
        </h3>
        {isLive && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-fade-in-up",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                message.role === "advisor"
                  ? "gradient-primary"
                  : "bg-white/[0.08]"
              )}
            >
              {message.role === "advisor" ? (
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              ) : (
                <User className="h-4 w-4 text-foreground" />
              )}
            </div>

            <div
              className={cn(
                "flex-1 max-w-[80%]",
                message.role === "user" && "flex flex-col items-end"
              )}
            >
              <div
                className={cn(
                  "rounded-xl px-4 py-3 mb-1",
                  message.role === "advisor"
                    ? "bg-white/[0.03] border border-white/[0.08]"
                    : "bg-primary/10 border border-primary/20"
                )}
              >
                <p className="text-sm text-foreground leading-relaxed">
                  {message.content}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

