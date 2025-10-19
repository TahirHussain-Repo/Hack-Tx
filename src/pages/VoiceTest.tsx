import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mic, Square, Trash2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";

export default function VoiceTest() {
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    onError: (err) => {
      toast({ title: "Voice Error", description: err, variant: "destructive" });
    },
  });

  useEffect(() => {
    // Quick permission probe
    (async () => {
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(status.state === 'granted');
      } catch {
        setHasPermission(null); // unsupported
      }
    })();
  }, []);

  const toggle = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    try {
      await startListening();
    } catch (e: any) {
      toast({ title: "Microphone Error", description: e?.message || String(e), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {!isSupported && (
        <GlassCard className="bg-accent/5 border-accent/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-accent mb-1">Voice Input Not Supported</h3>
              <p className="text-sm text-muted-foreground">Use Chrome or Edge to test voice input.</p>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-foreground">Voice to Text Test</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={"w-2 h-2 rounded-full " + (isListening ? "bg-primary animate-pulse" : "bg-muted/60")}></span>
            {isListening ? "Listening" : "Idle"}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button onClick={toggle} className="gap-2">
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Start"}
            </Button>
            <Button variant="outline" onClick={resetTranscript} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Mic permission: {hasPermission === null ? "unknown" : hasPermission ? "granted" : "not granted"}
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-xs text-muted-foreground mb-2">Final Transcript</div>
              <div className="min-h-[120px] whitespace-pre-wrap text-sm">{transcript || ""}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-xs text-muted-foreground mb-2">Live (Interim)</div>
              <div className="min-h-[120px] italic text-sm text-foreground/80">{interimTranscript || ""}</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}


