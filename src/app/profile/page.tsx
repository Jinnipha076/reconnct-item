"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Star, LogOut, ChevronRight, LogIn } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { initialsOf } from "@/lib/domain";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, session, userId, loading } = useAuth();
  const [tab, setTab] = useState<"active" | "closed">("active");

  const { data: myPosts = [], isLoading } = useQuery({
    queryKey: ["my-posts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const active = myPosts.filter((p) => p.status !== "closed");
  const closed = myPosts.filter((p) => p.status === "closed");
  const list = tab === "active" ? active : closed;

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("ออกจากระบบเรียบร้อยแล้ว");
    router.push("/auth");
  }

  if (!loading && !session) {
    return (
      <AppShell>
        <div className="px-6 py-20 text-center">
          <div className="size-16 rounded-3xl bg-muted mx-auto flex items-center justify-center text-3xl mb-4">
            👤
          </div>
          <h2 className="text-xl font-bold">ยังไม่ได้เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            เข้าสู่ระบบเพื่อดูประวัติประกาศ จัดการข้อมูลติดต่อ และติดตามสถานะเคสของคุณ
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-flex h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold items-center justify-center gap-2"
          >
            <LogIn className="size-4" /> เข้าสู่ระบบ / สมัครสมาชิก
          </Link>
        </div>
      </AppShell>
    );
  }

  const displayName = profile?.display_name || session?.user?.email?.split("@")[0] || "ผู้ใช้งาน";
  const initials = initialsOf(displayName);
  const reputation = profile?.reputation ? Number(profile.reputation).toFixed(1) : "5.0";

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[20px] font-bold">โปรไฟล์</h1>
          <ThemeToggle />
        </header>
      }
    >
      <section className="px-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.5_0.12_210)] text-primary-foreground p-5 shadow-[var(--shadow-pop)]">
          <div className="flex items-center gap-3">
            <div className="size-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl font-bold">
              {profile?.avatar_emoji || initials}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[17px] flex items-center gap-1.5">
                {displayName}
                {profile?.verified && <ShieldCheck className="size-4 text-accent" />}
              </p>
              <p className="text-[12.5px] opacity-90">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="ประกาศทั้งหมด" value={myPosts.length.toString()} />
            <Stat
              label="คะแนน"
              value={
                <span className="flex items-center justify-center gap-0.5">
                  <Star className="size-3.5 fill-current" />
                  {reputation}
                </span>
              }
            />
            <Stat label="ปิดเคสสำเร็จ" value={closed.length.toString()} />
          </div>
        </div>
      </section>

      <section className="px-4 mt-5 space-y-2">
        <Row label="ข้อมูลส่วนตัวและการติดต่อ" />
        <Row label="ประวัติการเปลี่ยนสถานะ" />
        <Row label="ความเป็นส่วนตัวและความปลอดภัย" />
      </section>

      <section className="px-4 mt-6">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <TabBtn active={tab === "active"} onClick={() => setTab("active")}>
            กำลังดำเนินการ ({active.length})
          </TabBtn>
          <TabBtn active={tab === "closed"} onClick={() => setTab("closed")}>
            ปิดเคสแล้ว ({closed.length})
          </TabBtn>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="h-28 rounded-2xl bg-muted animate-pulse" />
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
              ยังไม่มีประกาศในหมวดนี้
            </div>
          ) : (
            list.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </section>

      <section className="px-4 mt-8">
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl border border-destructive/30 text-destructive font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-destructive/10 transition"
        >
          <LogOut className="size-4" /> ออกจากระบบ
        </button>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur py-2.5">
      <p className="text-[18px] font-bold leading-none">{value}</p>
      <p className="text-[11px] opacity-90 mt-1">{label}</p>
    </div>
  );
}

function Row({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3.5 text-[14px] font-medium cursor-pointer hover:border-primary/40 transition">
      <span>{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition cursor-pointer ${
        active ? "bg-surface text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
