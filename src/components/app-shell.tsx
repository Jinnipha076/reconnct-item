"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Home, Search, PlusCircle, User } from "lucide-react";

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
    { href: "/", label: "ฟีด", icon: Home, match: (p: string) => p === "/" },
    { href: "/search", label: "ค้นหา", icon: Search, match: (p: string) => p.startsWith("/search") },
    { href: "/new", label: "โพสต์", icon: PlusCircle, primary: true, match: (p: string) => p.startsWith("/new") },
    { href: "/profile", label: "โปรไฟล์", icon: User, match: (p: string) => p.startsWith("/profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30">
      <div className="mx-3 mb-3 rounded-2xl bg-surface/95 backdrop-blur border border-border shadow-[var(--shadow-card)]">
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = t.match(pathname || "/");
            const Icon = t.icon;
            if (t.primary) {
              return (
                <li key={t.href} className="flex justify-center -mt-5">
                  <Link
                    href={t.href}
                    className="size-14 rounded-2xl bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-[var(--shadow-pop)] active:scale-95 transition"
                    aria-label={t.label}
                  >
                    <Icon className="size-6" />
                  </Link>
                </li>
              );
            }
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] transition ${
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
