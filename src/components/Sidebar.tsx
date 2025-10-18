import { NavLink } from "react-router-dom";
import { Phone, MessageSquare, Target, CreditCard, TrendingUp, Zap, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const navigation = [
  { name: "Advisor", href: "/", icon: Phone },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Insights", href: "/insights", icon: TrendingUp },
  { name: "Autopilot", href: "/autopilot", icon: Zap },
  { name: "Emergency", href: "/emergency", icon: AlertCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Nessie Demo", href: "/nessie", icon: Zap },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-card border-r border-white/10">
      <div className="flex h-full flex-col gap-y-5 px-6 py-8">
        <div className="flex h-20 shrink-0 items-center justify-center">
          <Logo size="md" showText={true} />
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
                      "group flex gap-x-3 rounded-lg px-4 py-3 text-sm font-medium leading-6 transition-all duration-200 focus-ring",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
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
