import { useState, useCallback } from "react";

export type SessionState = "idle" | "active" | "paused";
export type MicState = "idle" | "listening" | "processing";

export interface TranscriptMessage {
  id: string;
  role: "user" | "advisor";
  content: string;
  timestamp: Date;
}

export const useAdvisorSession = () => {
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [micState, setMicState] = useState<MicState>("idle");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  const startSession = useCallback(() => {
    setSessionState("active");
    // Add welcome message
    setMessages([
      {
        id: "1",
        role: "advisor",
        content: "Hello. I'm your MoneyTalks advisor. I've reviewed your recent financial activity. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const endSession = useCallback(() => {
    setSessionState("idle");
    setMicState("idle");
    setMessages([]);
  }, []);

  const toggleMic = useCallback(() => {
    if (sessionState !== "active") return;

    if (micState === "idle") {
      setMicState("listening");
      
      // Simulate voice detection after 2 seconds
      setTimeout(() => {
        setMicState("processing");
        
        // Simulate processing and response
        setTimeout(() => {
          const userMessage: TranscriptMessage = {
            id: Date.now().toString(),
            role: "user",
            content: "How am I doing with my budget this month?",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, userMessage]);
          setMicState("idle");
          
          // Add advisor response
          setTimeout(() => {
            const advisorMessage: TranscriptMessage = {
              id: (Date.now() + 1).toString(),
              role: "advisor",
              content: "You're doing well. You've spent $3,247 of your $3,750 budget, which is 87% utilization. Your spending is down 12% from last month, and your savings rate increased to 32%.",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, advisorMessage]);
          }, 1000);
        }, 1500);
      }, 2000);
    } else if (micState === "listening") {
      setMicState("idle");
    }
  }, [sessionState, micState]);

  const addMessage = useCallback((message: Omit<TranscriptMessage, "id" | "timestamp">) => {
    const newMessage: TranscriptMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  return {
    sessionState,
    micState,
    messages,
    startSession,
    endSession,
    toggleMic,
    addMessage,
  };
};

