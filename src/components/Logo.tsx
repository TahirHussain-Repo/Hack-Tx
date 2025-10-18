import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export const Logo = ({ size = "md", className, showText = true }: LogoProps) => {
  const sizeMap = {
    sm: { box: 32, text: "text-base" },
    md: { box: 48, text: "text-xl" },
    lg: { box: 64, text: "text-2xl" },
  };

  const { box, text } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon - Sound wave forming $ symbol */}
      <svg
        width={box}
        height={box}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(158 64% 52%)" />
            <stop offset="100%" stopColor="hsl(158 64% 42%)" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(45 93% 47%)" />
            <stop offset="50%" stopColor="hsl(45 93% 57%)" />
            <stop offset="100%" stopColor="hsl(45 93% 47%)" />
          </linearGradient>
        </defs>
        
        {/* Circular Background */}
        <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" opacity="0.1" />
        <circle cx="32" cy="32" r="30" stroke="url(#logoGradient)" strokeWidth="2" />
        
        {/* Stylized $ Symbol with Sound Wave Effect */}
        {/* Top curve of S */}
        <path
          d="M 38 20 Q 42 20 44 24 Q 44 28 38 30"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Middle connector with wave */}
        <path
          d="M 38 30 Q 32 32 26 30"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Bottom curve of S */}
        <path
          d="M 26 30 Q 20 32 20 36 Q 20 40 26 42"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Vertical line through S */}
        <line
          x1="32"
          y1="16"
          x2="32"
          y2="46"
          stroke="url(#logoGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        
        {/* Sound wave bars - left side */}
        <rect x="12" y="28" width="2" height="8" rx="1" fill="url(#accentGradient)" opacity="0.6" />
        <rect x="16" y="24" width="2" height="16" rx="1" fill="url(#accentGradient)" opacity="0.8" />
        
        {/* Sound wave bars - right side */}
        <rect x="46" y="24" width="2" height="16" rx="1" fill="url(#accentGradient)" opacity="0.8" />
        <rect x="50" y="28" width="2" height="8" rx="1" fill="url(#accentGradient)" opacity="0.6" />
        
        {/* Small accent dots for sparkle effect */}
        <circle cx="42" cy="18" r="1.5" fill="url(#accentGradient)" />
        <circle cx="22" cy="44" r="1.5" fill="url(#accentGradient)" />
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold leading-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent", text)}>
            MoneyTalks
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
            PERSONAL CFO
          </span>
        </div>
      )}
    </div>
  );
};

