import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Target, CreditCard, TrendingUp, Zap, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Chat Advisor", href: "/chat", icon: MessageSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Insights", href: "/insights", icon: TrendingUp },
  { name: "Autopilot", href: "/autopilot", icon: Zap },
  { name: "Emergency", href: "/emergency", icon: AlertCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-card border-r border-white/10">
      <div className="flex h-full flex-col gap-y-5 px-6 py-8">
        <div className="flex h-20 shrink-0 flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <span className="text-2xl font-bold text-card-foreground">MT</span>
          </div>
          <span className="text-lg font-bold text-foreground">MoneyTalks</span>
          <span className="text-xs text-muted-foreground">Your Personal CFO</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group flex gap-x-3 rounded-xl px-4 py-3 text-sm font-medium leading-6 transition-all duration-200",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30 glow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};
