import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface MattePanelProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const MattePanel = ({ className, hover, children, ...props }: MattePanelProps) => {
  return (
    <div
      className={cn(
        "matte-panel",
        hover && "transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.10]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

