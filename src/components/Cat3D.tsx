import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Box, Cone } from "@react-three/drei";
import * as THREE from "three";

type MoodType = "thriving" | "good" | "neutral" | "worried" | "stressed";

interface Cat3DProps {
  mood?: MoodType;
}

export const Cat3D = ({ mood = "good" }: Cat3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      if (hovered) {
        groupRef.current.rotation.y += 0.02;
      }
    }
  });

  const getMoodColor = () => {
    switch (mood) {
      case "thriving":
        return "#10b981"; // primary green
      case "good":
        return "#10b981";
      case "neutral":
        return "#64748b"; // secondary gray
      case "worried":
        return "#f59e0b"; // accent yellow
      case "stressed":
        return "#ef4444"; // destructive red
      default:
        return "#10b981";
    }
  };

  const getEyeExpression = () => {
    switch (mood) {
      case "stressed":
        return { scaleY: 0.3, offsetY: -0.05 }; // squinting
      case "worried":
        return { scaleY: 1.2, offsetY: 0.05 }; // wide eyes
      default:
        return { scaleY: 1, offsetY: 0 };
    }
  };

  const eyeExpr = getEyeExpression();
  const catColor = getMoodColor();

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <Sphere args={[0.8, 32, 32]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color={catColor} />
      </Sphere>

      {/* Head */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={catColor} />
      </Sphere>

      {/* Ears */}
      <Cone args={[0.2, 0.4, 3]} position={[-0.35, 0.95, 0]} rotation={[0, 0, -0.3]}>
        <meshStandardMaterial color={catColor} />
      </Cone>
      <Cone args={[0.2, 0.4, 3]} position={[0.35, 0.95, 0]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color={catColor} />
      </Cone>

      {/* Eyes */}
      <Sphere 
        args={[0.12, 16, 16]} 
        position={[-0.2, 0.6 + eyeExpr.offsetY, 0.4]}
        scale={[1, eyeExpr.scaleY, 1]}
      >
        <meshStandardMaterial color="#1a1a1a" emissive="#ffffff" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere 
        args={[0.12, 16, 16]} 
        position={[0.2, 0.6 + eyeExpr.offsetY, 0.4]}
        scale={[1, eyeExpr.scaleY, 1]}
      >
        <meshStandardMaterial color="#1a1a1a" emissive="#ffffff" emissiveIntensity={0.3} />
      </Sphere>

      {/* Nose */}
      <Sphere args={[0.06, 16, 16]} position={[0, 0.45, 0.55]}>
        <meshStandardMaterial color="#ff6b9d" />
      </Sphere>

      {/* Tail */}
      <Box args={[0.15, 0.8, 0.15]} position={[0, -0.3, -0.8]} rotation={[0.5, 0, 0]}>
        <meshStandardMaterial color={catColor} />
      </Box>

      {/* Paws */}
      <Sphere args={[0.15, 16, 16]} position={[-0.3, -0.9, 0.3]}>
        <meshStandardMaterial color={catColor} />
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0.3, -0.9, 0.3]}>
        <meshStandardMaterial color={catColor} />
      </Sphere>

      {/* Glow effect based on mood */}
      <pointLight 
        position={[0, 0.5, 0]} 
        intensity={mood === "thriving" ? 2 : mood === "good" ? 1 : 0.5} 
        distance={3} 
        color={catColor}
      />
    </group>
  );
};
