import { useEffect } from "react";
import { Bell, X, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer = ({ isOpen, onClose }: NotificationsDrawerProps) => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-background border-l border-white/[0.08] z-50 animate-slide-in-right overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <h2 id="notifications-title" className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="focus-ring"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread
          </p>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "glass-card p-4 cursor-pointer transition-all duration-200",
                notification.unread && "bg-white/[0.05] border-primary/20"
              )}
            >
              <div className="flex gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0 mt-0.5",
                  notification.type === "success" && "bg-primary/20",
                  notification.type === "warning" && "bg-accent/20",
                  notification.type === "info" && "bg-blue-500/20"
                )}>
                  {notification.type === "success" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  {notification.type === "warning" && <AlertCircle className="h-4 w-4 text-accent" />}
                  {notification.type === "info" && <TrendingUp className="h-4 w-4 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {notification.title}
                    </h3>
                    {notification.unread && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08]">
          <Button 
            variant="ghost" 
            className="w-full focus-ring"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>
    </>
  );
};

