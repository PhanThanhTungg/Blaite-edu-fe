"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { HappyProvider } from "@ant-design/happy-work-theme";
import { UserProvider } from "@/contexts/UserContext";

type ColorScheme = "light" | "dark";

interface ThemeContextValue {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function useInitializeTheme(): ColorScheme {
  // On first render (server or client), default to light to avoid hydration mismatch
  const [initial] = useState<ColorScheme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("theme") as ColorScheme | null;
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });
  return initial;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within AStudyAppProvider");
  return ctx;
}

export default function AStudyAppProvider({ children }: PropsWithChildren) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(useInitializeTheme());

  // Reflect to html class for Tailwind dark variants
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      window.localStorage.setItem("theme", colorScheme);
    } catch {}
  }, [colorScheme]);

  const setTheme = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setColorScheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const contextValue = useMemo<ThemeContextValue>(() => ({ colorScheme, toggleTheme, setTheme }), [colorScheme, toggleTheme, setTheme]);

  const antdAlgorithm = colorScheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={{ algorithm: antdAlgorithm }}>
        <UserProvider>
          <HappyProvider>
            {children}
          </HappyProvider>
        </UserProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
