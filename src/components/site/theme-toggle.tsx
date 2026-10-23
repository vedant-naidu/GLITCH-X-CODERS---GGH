"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("fxwise-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow)] transition hover:border-[var(--accent)]"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {mounted ? theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
    </button>
  );
}