import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ayursethu_a11y_large";

interface AccessibilityContextValue {
  largeText: boolean;
  toggleLargeText: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-large", largeText);
    try {
      localStorage.setItem(STORAGE_KEY, largeText ? "1" : "0");
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [largeText]);

  return (
    <AccessibilityContext.Provider value={{ largeText, toggleLargeText: () => setLargeText((v) => !v) }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
