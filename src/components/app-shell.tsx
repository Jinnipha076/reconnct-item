"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  ChibiHomeIcon,
  ChibiSearchIcon,
  ChibiPostIcon,
  ChibiChatIcon,
  ChibiProfileIcon,
} from "@/components/chibi-icons";

interface AppShellProps {
  children: ReactNode;
  /** Hides the bottom tab bar (e.g. on auth / create-post). */
  hideTabs?: boolean;
  /** Optional top bar slot. */
  topBar?: ReactNode;
}

export function AppShell({ children, hideTabs, topBar }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-background flex flex-col relative">
        {topBar}
        <main className={`flex-1 ${hideTabs ? "pb-6" : "pb-24"}`}>{children}</main>
        {!hideTabs && <BottomTabs />}
      </div>
    </div>
  );
}

function BottomTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "ฟีด", icon: ChibiHomeIcon, match: (p: string) => p === "/" },
    { href: "/search", label: "ค้นหา", icon: ChibiSearchIcon, match: (p: string) => p.startsWith("/search") },
    { href: "/new", label: "โพสต์", icon: ChibiPostIcon, isSpecial: true, match: (p: string) => p.startsWith("/new") },
    { href: "/chat", label: "แชท", icon: ChibiChatIcon, match: (p: string) => p.startsWith("/chat") },
    { href: "/profile", label: "โปรไฟล์", icon: ChibiProfileIcon, match: (p: string) => p.startsWith("/profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30">
      <div className="mx-3 mb-3 px-1 py-1.5 rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-[var(--shadow-card)]">
        <ul className="grid grid-cols-5 items-center">
          {tabs.map((t) => {
            const active = t.match(pathname || "/");
            const Icon = t.icon;
            return (
              <li key={t.href} className="flex justify-center">
                <Link
                  href={t.href}
                  className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 group active:scale-90 ${
                    active
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      t.isSpecial ? "scale-105" : ""
                    } ${active ? "scale-110" : ""}`}
                  >
                    <Icon active={active} className="size-6" />
                  </div>
                  <span
                    className={`text-[11px] leading-tight tracking-tight mt-1 transition-all ${
                      active ? "font-bold text-primary" : "font-medium"
                    }`}
                  >
                    {t.label}
                  </span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5 animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
