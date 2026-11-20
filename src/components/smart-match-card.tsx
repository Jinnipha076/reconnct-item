import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import type { SmartMatchResult } from "@/lib/smart-match";
import { CATEGORY_EMOJI, CATEGORY_LABEL, relativeTime } from "@/lib/domain";

export function SmartMatchSection({ matches }: { matches: SmartMatchResult[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-4 shadow-[var(--shadow-card)] space-y-3">
      {/* AI Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Sparkles className="size-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-[14.5px] text-foreground flex items-center gap-1.5">
              AI Smart Match
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                พบ {matches.length} รายการ
              </span>
            </h3>
            <p className="text-[11.5px] text-muted-foreground">
              ระบบ AI วิเคราะห์ความคล้ายจากหมวดหมู่ คีย์เวิร์ด และพิกัด
            </p>
          </div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="space-y-2.5 pt-1">
        {matches.map(({ post, score, reasons }) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block p-3 rounded-2xl bg-surface/90 backdrop-blur border border-border hover:border-primary/50 transition-all hover:-translate-y-0.5 shadow-sm group"
          >
            <div className="flex items-start gap-3">
              <div
                className="size-14 shrink-0 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
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
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" /> ตรงกัน {score}%
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    {relativeTime(post.created_at)}
                  </span>
                </div>

                <h4 className="font-semibold text-[13.5px] text-foreground truncate mt-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>

                <p className="text-[11px] text-muted-foreground truncate">
                  {CATEGORY_EMOJI[post.category]} {CATEGORY_LABEL[post.category]} • {post.location_text || "ไม่ระบุ"}
                </p>

                {/* Match Reasons pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {reasons.map((r, i) => (
                    <span
                      key={i}
                      className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 self-center text-muted-foreground group-hover:text-primary transition-colors">
                <ArrowRight className="size-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
