"use client";

import { useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  [key: string]: unknown;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const storedTheme = window.localStorage.getItem("fxwise-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : prefersDark ? "dark" : "light";

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, []);

  return children;
}