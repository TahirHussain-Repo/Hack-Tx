import { Play, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionState = "idle" | "active" | "paused";

interface SessionControlsProps {
  state: SessionState;
  onStart: () => void;
  onEnd: () => void;
  onGenerateGoals?: () => void;
  className?: string;
}

export const SessionControls = ({
  state,
  onStart,
  onEnd,
  onGenerateGoals,
  className,
}: SessionControlsProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {state === "idle" ? (
        <>
          <Button
            onClick={onStart}
            size="lg"
            className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity focus-ring gap-2"
          >
            <Play className="h-5 w-5" />
            Start Advisor Session
          </Button>
          {onGenerateGoals && (
            <Button
              onClick={onGenerateGoals}
              size="lg"
              variant="outline"
              className="focus-ring gap-2 border-white/[0.08] hover:bg-white/[0.05]"
            >
              <Sparkles className="h-5 w-5 text-accent" />
              Generate Goals
            </Button>
          )}
        </>
      ) : (
        <Button
          onClick={onEnd}
          size="lg"
          variant="destructive"
          className="focus-ring gap-2"
        >
          <Square className="h-5 w-5" />
          End Session
        </Button>
      )}
    </div>
  );
};

