import { createContext, useContext, useState, ReactNode } from "react";

interface DrawerContextType {
  isNotificationsOpen: boolean;
  isAdvisorOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  openAdvisor: () => void;
  closeAdvisor: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useDrawers = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawers must be used within DrawerProvider");
  }
  return context;
};

interface DrawerProviderProps {
  children: ReactNode;
}

export const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  const value: DrawerContextType = {
    isNotificationsOpen,
    isAdvisorOpen,
    openNotifications: () => setIsNotificationsOpen(true),
    closeNotifications: () => setIsNotificationsOpen(false),
    openAdvisor: () => setIsAdvisorOpen(true),
    closeAdvisor: () => setIsAdvisorOpen(false),
  };

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
};

