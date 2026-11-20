"use client";

import { useState } from "react";
import { ShieldCheck, X, Send, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface ClaimModalProps {
  postId: string;
  postTitle: string;
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ClaimModal({
  postId,
  postTitle,
  userId,
  onSuccess,
  onClose,
}: ClaimModalProps) {
  const [proofAnswer, setProofAnswer] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofAnswer.trim()) return;

    setBusy(true);
    try {
      const claimMessage = `[คำขอรับของคืน 🙋]\n• ข้อมูลยืนยันจุดสังเกต: ${proofAnswer.trim()}\n• ช่องทางติดต่อ: ${contactInfo.trim() || "ติดต่อทางแชทนี้"}`;

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: userId,
        message: claimMessage,
      });

      if (error) throw error;

      toast.success("ส่งคำขอรับของคืนเรียบร้อยแล้ว!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งคำขอไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-background rounded-3xl overflow-hidden shadow-2xl border border-border">
        {/* Header */}
        <div className="p-4 bg-primary-soft/80 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] leading-tight">ขอรับของคืน (ยืนยันตัวตน)</h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                {postTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer shadow-sm"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-accent/15 border border-accent/30 text-[12.5px] text-foreground/90 leading-relaxed flex gap-2">
            <Lock className="size-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-accent-foreground">ระบบป้องกันการแอบอ้าง</p>
              <p className="text-muted-foreground mt-0.5">
                กรุณาระบุรายละเอียด เช่น รอยตำหนิ สิ่งของด้านใน หรือลักษณะพิเศษที่คนอื่นไม่รู้ เพื่อให้ผู้พบของยืนยันตัวตนเจ้าของจริง
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-foreground mb-1.5">
              จุดสังเกต / ข้อมูลยืนยัน *
            </label>
            <textarea
              required
              rows={3}
              value={proofAnswer}
              onChange={(e) => setProofAnswer(e.target.value)}
              placeholder="เช่น มีสติกเกอร์รูปกาแฟด้านหลัง, ด้านในกระเป๋ามีบัตรนักศึกษาชื่อ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-[13.5px] focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-foreground mb-1.5">
              เบอร์โทร หรือ LINE ID เพื่อนัดรับ
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="เช่น 081-234-5678 หรือ line: @myid"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-[13.5px] focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border font-medium text-[13px] hover:bg-muted cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-[2] h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-[13px] shadow-[var(--shadow-pop)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              ส่งคำขอยืนยัน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
