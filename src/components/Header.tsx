import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useDrawers } from "@/contexts/DrawerContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { openNotifications } = useDrawers();

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative glass-card-hover focus-ring"
        onClick={openNotifications}
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
      </Button>
    </header>
  );
};
