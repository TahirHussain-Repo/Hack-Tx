import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  isActive: boolean;
  bars?: number;
  className?: string;
}

export const VoiceWaveform = ({ isActive, bars = 40, className }: VoiceWaveformProps) => {
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(20));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(bars).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array(bars)
          .fill(0)
          .map(() => Math.random() * 80 + 20)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, bars]);

  return (
    <div className={cn("flex items-center justify-center gap-1 h-32", className)}>
      {heights.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            isActive 
              ? "bg-gradient-to-t from-primary to-primary/50" 
              : "bg-muted/30"
          )}
          style={{
            height: `${isActive ? height : 20}%`,
            opacity: isActive ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

