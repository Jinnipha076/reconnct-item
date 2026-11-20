"use client";

import Link from "next/link";
import { MessageSquare, LogIn, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { relativeTime, type PostRow, type CommentRow } from "@/lib/domain";
import { StatusBadge, TypeBadge } from "@/components/badges";

interface ChatThread {
  post: PostRow;
  lastComment: CommentRow | null;
  commentCount: number;
}

export default function ChatListPage() {
  const { session, userId, loading } = useAuth();

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["chat-threads", userId],
    enabled: !!userId,
    queryFn: async () => {
      // 1. Get all comments where user commented or posts user created
      const [myPostsRes, myCommentsRes] = await Promise.all([
        supabase.from("posts").select("*").eq("user_id", userId!),
        supabase.from("comments").select("post_id").eq("user_id", userId!),
      ]);

      const myPostIds = (myPostsRes.data || []).map((p) => p.id);
      const commentedPostIds = (myCommentsRes.data || []).map((c) => c.post_id);
      const allPostIds = Array.from(new Set([...myPostIds, ...commentedPostIds]));

      if (allPostIds.length === 0) return [];

      // 2. Fetch posts details
      const { data: posts, error: postErr } = await supabase
        .from("posts")
        .select("*")
        .in("id", allPostIds)
        .order("updated_at", { ascending: false });

      if (postErr || !posts) return [];

      // 3. Fetch latest comments for these posts
      const threadList: ChatThread[] = await Promise.all(
        posts.map(async (p) => {
          const { data: comments } = await supabase
            .from("comments")
            .select("*")
            .eq("post_id", p.id)
            .order("created_at", { ascending: false });

          const allC = comments || [];
          return {
            post: p,
            lastComment: allC[0] || null,
            commentCount: allC.length,
          };
        })
      );

      return threadList;
    },
  });

  if (!loading && !session) {
    return (
      <AppShell>
        <div className="px-6 py-20 text-center">
          <div className="size-16 rounded-3xl bg-primary-soft text-primary mx-auto flex items-center justify-center mb-4">
            <MessageSquare className="size-8" />
          </div>
          <h2 className="text-xl font-bold">เข้าสู่ระบบเพื่อดูข้อความ</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            พูดคุย สอบถามข้อมูลตำหนิ และนัดรับของที่หายได้อย่างปลอดภัย
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-flex h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold items-center justify-center gap-2 shadow-[var(--shadow-pop)] cursor-pointer"
          >
            <LogIn className="size-4" /> เข้าสู่ระบบ / สมัครสมาชิก
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold">แชท & ประสานงาน</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                พื้นที่พูดคุยและนัดหมายส่งคืนของ
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-[12px] font-medium">
              <ShieldCheck className="size-3.5" /> ปลอดภัย
            </div>
          </div>
        </header>
      }
    >
      <section className="px-4 pt-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-3 mt-4">
            <div className="size-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-[15px]">ยังไม่มีบทสนทนา</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                เมื่อคุณส่งข้อความในประกาศ หรือมีคนมาแจ้งเบาะแสในโพสต์ของคุณ การสนทนาจะมาแสดงที่นี่
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-primary text-[13px] font-medium pt-2"
            >
              ดูประกาศของหายและพบของล่าสุด <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          threads.map(({ post, lastComment, commentCount }) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-border shadow-[var(--shadow-card)] hover:border-primary/40 transition"
            >
              <div
                className="size-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl overflow-hidden"
                style={{ background: `oklch(0.94 0.05 ${post.image_hue})` }}
              >
                {post.image_url ? (
                  <img src={post.image_url} alt="" className="size-full object-cover" />
                ) : (
                  post.image_emoji
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <TypeBadge type={post.type} />
                    <StatusBadge status={post.status} />
                  </div>
                  {lastComment && (
                    <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="size-3" />
                      {relativeTime(lastComment.created_at)}
                    </span>
                  )}
                </div>

                <p className="font-semibold text-[14px] truncate mt-1 text-foreground">
                  {post.title}
                </p>

                <p className="text-[12.5px] text-muted-foreground truncate mt-0.5">
                  {lastComment ? (
                    lastComment.message
                  ) : (
                    <span className="italic">ยังไม่มีข้อความ — เริ่มการพูดคุย</span>
                  )}
                </p>
              </div>

              {commentCount > 0 && (
                <div className="size-6 shrink-0 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                  {commentCount}
                </div>
              )}
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
}
