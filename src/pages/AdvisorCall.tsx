import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { VoiceWaveform } from "@/components/VoiceWaveform";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { MicControl } from "@/components/MicControl";
import { MicrophonePermission } from "@/components/MicrophonePermission";
import { Button } from "@/components/ui/button";
import { advisorApi } from "@/services/advisorApiService";
import { audioService } from "@/services/audioService";
import { AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";

export default function AdvisorCall() {
  const { toast } = useToast();
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "advisor"; content: string; timestamp: Date }>>([]);

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
    let status: PermissionStatus | null = null;
    const handleChange = () => {
      if (status) setMicPermissionGranted(status.state === 'granted');
    };
    const checkPermission = async () => {
      try {
        status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermissionGranted(status.state === 'granted');
        status.addEventListener('change', handleChange);
      } catch {
        setMicPermissionGranted(false);
      }
    };
    checkPermission();
    return () => {
      if (status) {
        try {
          status.removeEventListener('change', handleChange);
        } catch (cleanupError) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const toggleMic = async () => {
    if (!isSupported) {
      toast({ title: "Not Supported", description: "Use Chrome or Edge.", variant: "destructive" });
      return;
    }
    if (!micPermissionGranted) {
      toast({ title: "Permission Required", description: "Grant microphone access first.", variant: "destructive" });
        return;
      }
    if (isListening) {
      stopListening();
        return;
      }
      try {
        resetTranscript();
        await startListening();
  } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Microphone Error", description: message, variant: "destructive" });
    }
  };

  const sendToAdvisor = async () => {
    const text = (transcript || "").trim();
    if (!text) return;
    // Append user message to transcript
    const userMsg = { id: Date.now().toString(), role: "user" as const, content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    try {
      let sid = sessionId;
      if (!sid) {
        const session = await advisorApi.startSession();
        sid = session.session_id;
        setSessionId(sid);
      }
      const res = await advisorApi.sendMessage(sid!, text);
      const aiMsg = { id: (Date.now() + 1).toString(), role: "advisor" as const, content: res.response, timestamp: new Date(res.timestamp) };
      setMessages((prev) => [...prev, aiMsg]);
      // Clear the text input transcript after send
      resetTranscript();
      try {
        const audioBlob = await advisorApi.synthesizeSpeech(res.response);
        await audioService.play(audioBlob);
      } catch (e: unknown) {
        // TTS failure shouldn't block UI
        console.error("TTS error", e);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Advisor Error", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="animate-fade-in-up max-w-7xl mx-auto">
      <Header
        title="Advisor"
        subtitle="Voice-first financial guidance powered by AI"
      />

      {!isSupported && (
        <GlassCard className="mb-6 bg-accent/5 border-accent/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-accent mb-1">Voice Input Not Supported</h3>
              <p className="text-sm text-muted-foreground">Use Chrome or Edge for the full experience.</p>
            </div>
          </div>
        </GlassCard>
      )}

      {isSupported && !micPermissionGranted && (
        <div className="mb-6">
          <MicrophonePermission onRequestPermission={async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              stream.getTracks().forEach(t => t.stop());
              setMicPermissionGranted(true);
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : String(e);
              toast({ title: "Permission Error", description: message, variant: "destructive" });
            }
          }} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="relative overflow-hidden p-6">
            <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                {isListening ? "Listening..." : "Tap the mic to speak"}
                </h3>
                <p className="text-sm text-muted-foreground">
                Your speech will appear as text below
                </p>
              </div>

              {interimTranscript && (
                <div className="mb-4 text-center">
                <p className="text-sm text-primary/70 italic">"{interimTranscript}"</p>
                </div>
              )}

            <div className="flex justify-center mb-6">
                  <MicControl
                state={isListening ? "listening" : "idle"}
                onToggle={toggleMic}
                    size="lg"
                  />
            </div>

            <VoiceWaveform isActive={isListening} bars={40} />
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-foreground">Call Transcript</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setMessages([])} className="gap-2">Clear</Button>
                <Button onClick={sendToAdvisor} disabled={!transcript.trim()} className="gap-2">Send to Advisor</Button>
              </div>
            </div>
            <TranscriptPanel
              messages={messages}
              isLive={isListening}
              liveUserMessage={interimTranscript}
              className="p-0"
            />
          </GlassCard>

          {/* error display remains in left column */}

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
              </div>
        {/* Right column currently unused */}
      </div>
    </div>
  );
}

