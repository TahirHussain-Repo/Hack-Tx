import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MicState = "idle" | "listening" | "processing";

interface MicControlProps {
  state: MicState;
  onToggle: () => void;
  size?: "default" | "lg";
}

export const MicControl = ({ state, onToggle, size = "default" }: MicControlProps) => {
  const isLarge = size === "lg";
  
  return (
    <Button
      onClick={onToggle}
      size="icon"
      className={cn(
        "rounded-full focus-ring relative transition-all duration-200",
        isLarge ? "w-20 h-20" : "w-14 h-14",
        state === "listening" 
          ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25 animate-pulse" 
          : state === "processing"
          ? "bg-accent/20 text-accent"
          : "glass-card-hover text-foreground"
      )}
      disabled={state === "processing"}
    >
      {state === "processing" ? (
        <Loader2 className={cn("animate-spin", isLarge ? "h-8 w-8" : "h-6 w-6")} />
      ) : state === "listening" ? (
        <Mic className={cn(isLarge ? "h-8 w-8" : "h-6 w-6")} />
      ) : (
        <MicOff className={cn(isLarge ? "h-8 w-8" : "h-6 w-6")} />
      )}
      
      {/* Pulsing ring effect when listening */}
      {state === "listening" && (
        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
      )}
    </Button>
  );
};

