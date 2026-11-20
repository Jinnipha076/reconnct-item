"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved === "dark" || (!saved && prefersDark);
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) {
    return <div className={`size-9 rounded-full bg-surface border border-border ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`size-9 rounded-full bg-surface/90 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-90 transition-all cursor-pointer shadow-sm ${className}`}
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดกลางคืน"}
      title={isDark ? "โหมดสว่าง" : "โหมดมืด"}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="size-4 text-indigo-500 animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
}
