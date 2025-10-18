import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { GlassCard } from "./GlassCard";
import { Cat3D } from "./Cat3D";

type MoodType = "thriving" | "good" | "neutral" | "worried" | "stressed";

interface AvatarWidgetProps {
  mood?: MoodType;
}

export const AvatarWidget = ({ mood = "good" }: AvatarWidgetProps) => {
  const [currentMood, setCurrentMood] = useState<MoodType>(mood);

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const getMoodLabel = () => {
    switch (currentMood) {
      case "thriving":
        return "Thriving";
      case "good":
        return "Doing Well";
      case "neutral":
        return "Steady";
      case "worried":
        return "Concerned";
      case "stressed":
        return "Stressed";
      default:
        return "Good";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 h-80">
      <GlassCard className="w-full h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-foreground">Your Financial Companion</h3>
          <p className="text-xs text-muted-foreground mt-1">Status: {getMoodLabel()}</p>
        </div>
        <div className="flex-1 relative">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="city" />
            <Cat3D mood={currentMood} />
          </Canvas>
        </div>
        <div className="p-3 border-t border-white/10 text-center">
          <p className="text-xs text-muted-foreground">Click and drag to interact</p>
        </div>
      </GlassCard>
    </div>
  );
};
