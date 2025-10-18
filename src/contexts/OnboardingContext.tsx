import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    // Check localStorage on initial load
    const completed = localStorage.getItem("onboarding_completed");
    return completed === "true";
  });

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsOnboardingComplete(true);
  };

  useEffect(() => {
    // Sync with localStorage changes (if needed across tabs)
    const handleStorageChange = () => {
      const completed = localStorage.getItem("onboarding_completed");
      setIsOnboardingComplete(completed === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <OnboardingContext.Provider value={{ isOnboardingComplete, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

