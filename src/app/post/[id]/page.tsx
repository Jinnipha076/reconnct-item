"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Send,
  Lock,
  Flag,
  Trash2,
  Handshake,
} from "lucide-react";
import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, TypeBadge } from "@/components/badges";
import { ThemeToggle } from "@/components/theme-toggle";
import { SmartMatchSection } from "@/components/smart-match-card";
import { ClaimModal } from "@/components/claim-modal";
import { findSmartMatches } from "@/lib/smart-match";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  STATUS_LABEL,
  initialsOf,
  relativeTime,
  type CommentRow,
  type PostRow,
  type PostStatus,
  type ProfileRow,
} from "@/lib/domain";

const PostMiniMap = dynamic(
  () => import("@/components/map/post-mini-map").then((mod) => mod.PostMiniMap),
  { ssr: false }
);

export default function PostDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell hideTabs>
          <div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>
        </AppShell>
      }
    >
      <PostDetailContent />
    </Suspense>
  );
}

function PostDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const qc = useQueryClient();
  const { userId, isAdmin } = useAuth();
  const [message, setMessage] = useState("");
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["post", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!post) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", post.user_id)
        .maybeSingle();
      return { post: post as PostRow, profile: (profile ?? null) as ProfileRow | null };
    },
  });

  // Query other posts for AI smart matching
  const { data: allPosts = [] } = useQuery({
    queryKey: ["posts-for-matching"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .limit(60);
      return (data || []) as PostRow[];
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at");
      if (error) throw error;
      const ids = [...new Set(rows.map((r) => r.user_id))];
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("*").in("id", ids)
        : { data: [] as ProfileRow[] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null })) as Array<
        CommentRow & { profile: ProfileRow | null }
      >;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      const { error } = await supabase
        .from("comments")
        .insert({ post_id: id, user_id: userId, message: message.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      void qc.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: async (status: PostStatus) => {
      const { error } = await supabase.from("posts").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("อัปเดตสถานะแล้ว");
      void qc.invalidateQueries({ queryKey: ["post", id] });
      void qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const report = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("กรุณาเข้าสู่ระบบก่อนรายงาน");
      const reason = window.prompt("เหตุผลในการรายงานประกาศนี้");
      if (!reason) return;
      const { error } = await supabase
        .from("reports")
        .insert({ post_id: id, reporter_id: userId, reason });
      if (error) throw error;
      toast.success("ส่งรายงานให้แอดมินแล้ว");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <AppShell hideTabs>
        <div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>
      </AppShell>
    );
  }
  if (!data) {
    return (
      <AppShell hideTabs>
        <div className="p-8 text-center text-muted-foreground">ไม่พบประกาศนี้</div>
      </AppShell>
    );
  }

  const { post, profile } = data;
  const isOwner = userId === post.user_id;
  const smartMatches = post ? findSmartMatches(post, allPosts) : [];

  const happened = new Date(post.happened_at).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <AppShell hideTabs>
      {/* Top Banner & Picture */}
      <div
        className="relative h-64 flex items-center justify-center text-8xl overflow-hidden"
        style={{ background: `oklch(0.9 0.06 ${post.image_hue})` }}
      >
        {post.image_url ? (
          <img src={post.image_url} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden>{post.image_emoji}</span>
        )}

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)] cursor-pointer hover:bg-surface"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => report.mutate()}
            className="size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)] cursor-pointer hover:bg-surface"
            aria-label="รายงานโพสต์"
          >
            <Flag className="size-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            <span className="chip">
              {CATEGORY_EMOJI[post.category]} {CATEGORY_LABEL[post.category]}
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-bold leading-snug text-foreground">{post.title}</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            โพสต์เมื่อ {relativeTime(post.created_at)}
          </p>
        </div>

        {/* Claim button if found and not owner */}
        {post.type === "found" && !isOwner && post.status !== "closed" && (
          <button
            type="button"
            onClick={() => {
              if (!userId) {
                toast.error("กรุณาเข้าสู่ระบบก่อนส่งคำขอรับของคืน");
                router.push("/auth");
                return;
              }
              setShowClaimModal(true);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-[14.5px] shadow-lg hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Handshake className="size-5" /> นี่คือของของฉัน (ขอรับของคืน)
          </button>
        )}

        {/* Case Status Management for Owner / Admin */}
        {(isOwner || isAdmin) && (
          <div className="rounded-2xl bg-surface border border-border p-4">
            <p className="text-[13px] font-semibold mb-2">จัดการสถานะเคส</p>
            <div className="flex gap-2">
              {(["searching", "arranging", "closed"] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus.mutate(s)}
                  disabled={post.status === s}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-medium border transition cursor-pointer ${
                    post.status === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location & Time */}
        <div className="rounded-2xl bg-surface border border-border p-4 space-y-3">
          <Row
            icon={<MapPin className="size-4" />}
            label="สถานที่"
            value={post.location_text || "ไม่ระบุ"}
          />
          <Row
            icon={<Calendar className="size-4" />}
            label={post.type === "lost" ? "เวลาที่หาย" : "เวลาที่พบ"}
            value={happened}
          />
        </div>

        {/* Mini Interactive Map */}
        {typeof post.latitude === "number" && typeof post.longitude === "number" && (
          <PostMiniMap
            lat={post.latitude}
            lng={post.longitude}
            title={post.title}
            type={post.type}
            locationText={post.location_text}
          />
        )}

        {/* Description */}
        <section>
          <h2 className="font-semibold mb-2">รายละเอียด</h2>
          <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-line">
            {post.description || "—"}
          </p>
        </section>

        {/* Secret Marks / Ownership Verification */}
        <section>
          <h2 className="font-semibold mb-2">ตำหนิ / จุดสังเกต</h2>
          <div className="rounded-2xl border border-accent/40 bg-accent/15 p-4 text-[14px] text-foreground/90 leading-relaxed">
            {isOwner || isAdmin ? (
              <div>
                <p className="font-medium text-foreground">{post.marks || "ไม่ได้ระบุจุดสังเกตไว้"}</p>
                <p className="text-[11.5px] text-muted-foreground mt-1">
                  (เฉพาะคุณและแอดมินเท่านั้นที่เห็นข้อมูลจุดสังเกตนี้)
                </p>
              </div>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Lock className="size-4 text-accent" /> ซ่อนไว้เพื่อยืนยันเจ้าของตัวจริง (กดปุ่มขอรับของคืนเพื่อระบุจุดสังเกต)
              </span>
            )}
          </div>
        </section>

        {/* AI Smart Match Section */}
        {smartMatches.length > 0 && (
          <section>
            <SmartMatchSection matches={smartMatches} />
          </section>
        )}

        {/* Poster Profile */}
        <section className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4">
          <div className="size-11 rounded-full bg-primary-soft text-primary font-semibold flex items-center justify-center">
            {profile ? initialsOf(profile.display_name) : "??"}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[14px] flex items-center gap-1">
              {profile?.display_name ?? "ผู้ใช้งาน"}
              {profile?.verified && (
                <ShieldCheck className="size-4 text-primary" aria-label="ยืนยันตัวตนแล้ว" />
              )}
            </p>
            <p className="text-[12px] text-muted-foreground">
              ความน่าเชื่อถือ ★ {Number(profile?.reputation ?? 5).toFixed(1)}
            </p>
          </div>
          <Link
            href="/profile"
            className="text-[12.5px] font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-full"
          >
            โปรไฟล์
          </Link>
        </section>

        {/* Coordination & Comments */}
        <section>
          <h2 className="font-semibold mb-2">พื้นที่ประสานงาน ({comments.length})</h2>
          <div className="space-y-2">
            {comments.length === 0 && (
              <p className="text-[13px] text-muted-foreground">
                ยังไม่มีข้อความ — เริ่มพูดคุยเพื่อยืนยันและนัดรับของได้เลย
              </p>
            )}
            {comments.map((c) => {
              const isClaim = c.message.startsWith("[คำขอรับของคืน 🙋]");
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl p-3 border transition ${
                    isClaim
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-surface border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold flex items-center gap-1.5">
                      {c.profile?.display_name ?? "ผู้ใช้งาน"}
                      {isClaim && (
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                          ขอรับของคืน
                        </span>
                      )}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(c.created_at)}
                    </span>
                  </div>
                  <p className="text-[13.5px] mt-1 text-foreground/90 whitespace-pre-line">
                    {c.message}
                  </p>
                  {(c.user_id === userId || isAdmin) && (
                    <button
                      onClick={async () => {
                        await supabase.from("comments").delete().eq("id", c.id);
                        void qc.invalidateQueries({ queryKey: ["comments", id] });
                      }}
                      className="mt-1 text-[11.5px] text-destructive flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3" /> ลบ
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {userId ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) addComment.mutate();
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="พิมพ์ข้อความแจ้งเบาะแสหรือนัดหมาย..."
                className="flex-1 px-4 h-11 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary text-foreground"
              />
              <button
                type="submit"
                className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-sm"
                aria-label="ส่งข้อความ"
              >
                <Send className="size-5" />
              </button>
            </form>
          ) : (
            <Link
              href="/auth"
              className="mt-3 w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center shadow-sm"
            >
              เข้าสู่ระบบเพื่อพูดคุย
            </Link>
          )}
        </section>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          postId={id}
          postTitle={post.title}
          userId={userId!}
          onSuccess={() => {
            void qc.invalidateQueries({ queryKey: ["comments", id] });
          }}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </AppShell>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-primary">{icon}</span>
      <span className="text-[13px] text-muted-foreground w-24">{label}</span>
      <span className="text-[13.5px] font-medium flex-1 text-right text-foreground">{value}</span>
    </div>
  );
}
