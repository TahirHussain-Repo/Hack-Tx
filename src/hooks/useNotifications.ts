import { useState, useCallback } from "react";
import { mockNotifications, type Notification } from "@/lib/mockData";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
  };
};

