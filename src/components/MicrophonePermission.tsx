import { Mic, AlertCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Button } from "./ui/button";

interface MicrophonePermissionProps {
  onRequestPermission: () => void;
}

export const MicrophonePermission = ({ onRequestPermission }: MicrophonePermissionProps) => {
  return (
    <GlassCard className="bg-primary/5 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/20">
          <Mic className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-primary mb-2">Microphone Access Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To use voice input, please allow microphone access when your browser prompts you.
          </p>
          
          <div className="space-y-2 text-xs text-muted-foreground mb-4">
            <p className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Click the button below to request permission</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Your browser will show a popup - click <strong>"Allow"</strong></span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Voice input will be enabled!</span>
            </p>
          </div>

          <Button 
            onClick={onRequestPermission}
            className="gradient-primary text-primary-foreground focus-ring mb-3"
          >
            <Mic className="h-4 w-4 mr-2" />
            Request Microphone Access
          </Button>

          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-accent">If you accidentally clicked "Block":</strong><br/>
              Look for the 🔒 or camera/mic icon in your browser's address bar, click it, and change microphone to "Allow". Then refresh this page.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

