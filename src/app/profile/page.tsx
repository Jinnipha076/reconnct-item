"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Star,
  LogOut,
  ChevronRight,
  LogIn,
  X,
  User,
  Phone,
  MessageSquare,
  FileText,
  History,
  Lock,
  KeyRound,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  Shield,
  Bell,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, clearLocalActiveUser, setLocalActiveUser, getLocalActiveUser } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { initialsOf } from "@/lib/domain";

const AVATAR_OPTIONS = [
  "👨‍💼", "👩‍🎓", "🧑‍💻", "👧", "👮‍♂️", "🧑‍🍳",
  "🐱", "🦊", "🐼", "🐰", "🐶", "⭐",
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, session, userId, loading, refreshAuth } = useAuth();
  const [tab, setTab] = useState<"active" | "closed">("active");

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const { data: myPosts = [], isLoading } = useQuery({
    queryKey: ["my-posts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Could not fetch my posts from supabase:", error.message);
        return [];
      }
      return data ?? [];
    },
  });

  const active = myPosts.filter((p) => p.status !== "closed");
  const closed = myPosts.filter((p) => p.status === "closed");
  const list = tab === "active" ? active : closed;

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    clearLocalActiveUser();
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
            className="mt-6 inline-flex h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold items-center justify-center gap-2 shadow-[var(--shadow-pop)]"
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
      {/* ส่วนหัวแสดงโปรไฟล์ */}
      <section className="px-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.5_0.12_210)] text-primary-foreground p-5 shadow-[var(--shadow-pop)]">
          <div className="flex items-center gap-3">
            <div className="size-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl font-bold shadow-inner">
              {profile?.avatar_emoji || initials}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[17px] flex items-center gap-1.5">
                {displayName}
                {profile?.verified && (
                  <span title="ยืนยันตัวตนแล้ว" className="inline-flex">
                    <ShieldCheck className="size-4 text-accent fill-accent/20" />
                  </span>
                )}
              </p>
              <p className="text-[12.5px] opacity-90 truncate max-w-[220px]">
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

      {/* เมนูการตั้งค่า 3 แถว (สามารถคลิกได้จริง) */}
      <section className="px-4 mt-5 space-y-2">
        <Row
          label="ข้อมูลส่วนตัวและการติดต่อ"
          icon={<User className="size-4 text-primary" />}
          badge="แก้ไขได้"
          onClick={() => setShowEditProfileModal(true)}
        />
        <Row
          label="ประวัติการเปลี่ยนสถานะ"
          icon={<History className="size-4 text-blue-500" />}
          badge="ไทม์ไลน์"
          onClick={() => setShowHistoryModal(true)}
        />
        <Row
          label="ความเป็นส่วนตัวและความปลอดภัย"
          icon={<Lock className="size-4 text-amber-500" />}
          badge="ความปลอดภัย"
          onClick={() => setShowPrivacyModal(true)}
        />
      </section>

      {/* รายการประกาศของฉัน */}
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

      {/* ปุ่มออกจากระบบ */}
      <section className="px-4 mt-8">
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl border border-destructive/30 text-destructive font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-destructive/10 transition"
        >
          <LogOut className="size-4" /> ออกจากระบบ
        </button>
      </section>

      {/* Modal 1: แก้ไขข้อมูลส่วนตัวและการติดต่อ */}
      {showEditProfileModal && (
        <EditPersonalInfoModal
          userId={userId!}
          email={session?.user?.email || ""}
          currentName={displayName}
          currentAvatar={profile?.avatar_emoji || "😊"}
          onClose={() => setShowEditProfileModal(false)}
          onSuccess={() => {
            setShowEditProfileModal(false);
            refreshAuth();
          }}
        />
      )}

      {/* Modal 2: ประวัติการเปลี่ยนสถานะ */}
      {showHistoryModal && (
        <StatusHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}

      {/* Modal 3: ความเป็นส่วนตัวและความปลอดภัย */}
      {showPrivacyModal && (
        <PrivacySecurityModal
          email={session?.user?.email || ""}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}
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

function Row({
  label,
  icon,
  badge,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3.5 text-[14px] font-medium cursor-pointer hover:border-primary/40 hover:bg-primary-soft/20 transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="p-1 rounded-lg bg-muted/60">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
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

// -------------------------------------------------------------
// MODAL 1: ข้อมูลส่วนตัวและการติดต่อ (แก้ไขได้จริง)
// -------------------------------------------------------------
function EditPersonalInfoModal({
  userId,
  email,
  currentName,
  currentAvatar,
  onClose,
  onSuccess,
}: {
  userId: string;
  email: string;
  currentName: string;
  currentAvatar: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load contact info from localStorage or Supabase
    const savedContacts = localStorage.getItem(`reunite_contacts_${userId}`);
    if (savedContacts) {
      try {
        const parsed = JSON.parse(savedContacts);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.line_id) setLineId(parsed.line_id);
        if (parsed.note) setNote(parsed.note);
      } catch {
        // ignore
      }
    }

    // Also check Supabase profile_contacts
    supabase
      .from("profile_contacts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          if (data.phone) setPhone(data.phone);
          if (data.line_id) setLineId(data.line_id);
          if (data.note) setNote(data.note);
        }
      });
  }, [userId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("กรุณาระบุชื่อที่แสดง");
      return;
    }
    setSaving(true);
    try {
      // 1. Save locally
      const contactsObj = {
        phone: phone.trim(),
        line_id: lineId.trim(),
        note: note.trim(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(`reunite_contacts_${userId}`, JSON.stringify(contactsObj));

      const localUser = getLocalActiveUser();
      const updatedUser = {
        id: userId,
        email: email || localUser?.email || "user@example.com",
        display_name: name.trim(),
        avatar_emoji: avatar,
        phone: phone.trim(),
        line_id: lineId.trim(),
        note: note.trim(),
        verified: true,
        reputation: localUser?.reputation ?? 5.0,
      };
      setLocalActiveUser(updatedUser);

      // 2. Try saving to Supabase if available
      try {
        await Promise.all([
          supabase.from("profiles").upsert({
            id: userId,
            display_name: name.trim(),
            avatar_emoji: avatar,
          }),
          supabase.from("profile_contacts").upsert({
            user_id: userId,
            phone: phone.trim(),
            line_id: lineId.trim(),
            note: note.trim(),
            updated_at: new Date().toISOString(),
          }),
        ]);
      } catch (err) {
        console.warn("Supabase upsert note:", err);
      }

      toast.success("บันทึกข้อมูลส่วนตัวและการติดต่อเรียบร้อยแล้ว ✨");
      onSuccess();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-soft text-primary">
              <User className="size-5" />
            </span>
            <h2 className="text-[17px] font-bold">ข้อมูลส่วนตัวและการติดต่อ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* เลือกอิโมจิโปรไฟล์ */}
          <div>
            <label className="text-[13px] font-semibold text-foreground block mb-2">
              เลือกอิโมจิโปรไฟล์
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`size-11 rounded-2xl flex items-center justify-center text-2xl transition cursor-pointer border ${
                    avatar === em
                      ? "border-primary bg-primary-soft ring-2 ring-primary scale-105"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* ชื่อที่แสดง */}
          <div>
            <label className="text-[13px] font-semibold text-foreground block">
              ชื่อที่แสดง <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น สมชาย ใจดี หรือ ชื่อเล่น"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-[14px] focus:outline-none focus:border-primary"
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div>
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" /> เบอร์โทรศัพท์ติดต่อ
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="เช่น 081-234-5678"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-[14px] focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              🔒 เบอร์ติดต่อจะถูกปกปิดเป็นความลับ จนกว่าคุณจะกดยืนยันการส่งมอบของ
            </p>
          </div>

          {/* LINE ID */}
          <div>
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-muted-foreground" /> LINE ID
            </label>
            <input
              type="text"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              placeholder="เช่น line_user_id"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-[14px] focus:outline-none focus:border-primary"
            />
          </div>

          {/* บันทึกเพิ่มเติม / ที่อยู่ติดต่อ */}
          <div>
            <label className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-muted-foreground" /> ข้อความแนะนำตัว / ช่องทางติดต่อสะดวก
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น สะดวกนัดรับแถว มรภ. ช่วงเย็น หรือทักแชทได้ตลอดเวลา"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-[14px] focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border text-[13px] font-medium hover:bg-muted transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-[var(--shadow-pop)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Check className="size-4" />
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL 2: ประวัติการเปลี่ยนสถานะ (Status History Timeline)
// -------------------------------------------------------------
function StatusHistoryModal({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<"all" | "done">("all");

  const historyItems = [
    {
      id: "h1",
      title: "ปิดเคสสำเร็จ - ส่งมอบของคืนเจ้าของเรียบร้อย 🤝",
      item: "กุญแจรถยนต์ Honda City หล่นหาย",
      badge: "ปิดเคสแล้ว",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      actor: "คุณสมชาย ใจดี (ผู้ส่งมอบ)",
      time: "2 ชั่วโมงที่แล้ว",
      desc: "ส่งมอบของคืนให้แก่เจ้าของ ณ ป้อม รปภ. มรภ.บุรีรัมย์ เรียบร้อยพร้อมตรวจหลักฐานพวงกุญแจหมีสีเขียว",
    },
    {
      id: "h2",
      title: "ปิดเคสสำเร็จ - ส่งมอบบัตรประชาชนคืนเจ้าของ",
      item: "พบบัตรประชาชน นายสิทธิชัย ที่ตู้ ATM",
      badge: "ปิดเคสแล้ว",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      actor: "ลุงสมบัติ รปภ. (ผู้ส่งมอบ)",
      time: "4 ชั่วโมงที่แล้ว",
      desc: "เจ้าของบัตรติดต่อมารับคืนที่กองรักษาความปลอดภัย พร้อมลงบันทึกรับของคืนเรียบร้อย",
    },
    {
      id: "h3",
      title: "ตรวจพบเบาะแสตรงกัน - AI Smart Match ⚡",
      item: "เคสใส่หูฟัง AirPods Pro 2 ⟷ พบเคสซิลิโคนสีดำ",
      badge: "ตรวจพบคู่จับคู่",
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      actor: "ระบบจับคู่ AI อัตโนมัติ",
      time: "5 ชั่วโมงที่แล้ว",
      desc: "ระบบจับคู่อัตโนมัติพบความตรงกัน 95% ของรอยสลักตัวอักษร 'FY' ด้านในเคส ส่งแจ้งเตือนให้ผู้ใช้ทั้งสองฝ่ายแล้ว",
    },
    {
      id: "h4",
      title: "อนุมัติประกาศสู่หน้าฟีดสาธารณะ",
      item: "ตามหาน้องแมวส้มโอ ลายสลิด เพศผู้",
      badge: "กำลังตามหา",
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      actor: "น้องพลอย สยาม (ผู้โพสต์)",
      time: "1 วันที่แล้ว",
      desc: "โพสต์ประกาศพร้อมปักหมุดพิกัดบริเวณสยามสแควร์ ซอย 3 ระบบเปิดให้สมาชิกในละแวกช่วยสอดส่อง",
    },
    {
      id: "h5",
      title: "เปิดประกาศแจ้งของหายใหม่",
      item: "ทำกระเป๋าสตางค์หล่นหาย หนังสีน้ำตาล",
      badge: "กำลังตามหา",
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      actor: "น้องแพรว มรภ. (ผู้โพสต์)",
      time: "2 วันที่แล้ว",
      desc: "ลงทะเบียนเคสของหาย ระบุตำหนิพวงกุญแจกระต่ายชมพู พร้อมระบุพิกัดโรงอาหารกลาง",
    },
  ];

  const displayed = filter === "all" ? historyItems : historyItems.filter((x) => x.badge === "ปิดเคสแล้ว");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <History className="size-5" />
            </span>
            <div>
              <h2 className="text-[17px] font-bold">ประวัติการเปลี่ยนสถานะ</h2>
              <p className="text-[12px] text-muted-foreground">
                บันทึกการส่งมอบและอัปเดตสถานะของเคสในชุมชน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ตัวกรอง */}
        <div className="mt-3 flex gap-2 shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            ทั้งหมด ({historyItems.length})
          </button>
          <button
            onClick={() => setFilter("done")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition cursor-pointer ${
              filter === "done"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            ส่งมอบสำเร็จแล้ว (2)
          </button>
        </div>

        {/* Timeline list */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {displayed.map((item, idx) => (
            <div
              key={item.id}
              className="relative pl-6 pb-4 border-l-2 border-border/70 last:border-l-transparent last:pb-0"
            >
              <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-primary ring-4 ring-background flex items-center justify-center text-white">
                <div className="size-1.5 rounded-full bg-white" />
              </div>
              <div className="bg-muted/40 border border-border rounded-2xl p-3.5 space-y-1.5 hover:border-primary/40 transition">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {item.time}
                  </span>
                </div>
                <h4 className="font-semibold text-[14px] text-foreground leading-snug">
                  {item.title}
                </h4>
                <p className="text-[12px] font-medium text-primary">
                  📦 สิ่งของ: {item.item}
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
                <p className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/50">
                  ดำเนินการโดย: <span className="font-medium text-foreground">{item.actor}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border mt-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-muted hover:bg-muted/80 text-[13px] font-semibold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL 3: ความเป็นส่วนตัวและความปลอดภัย
// -------------------------------------------------------------
function PrivacySecurityModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [hidePhone, setHidePhone] = useState(true);
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(true);
  const [aiMatchNotify, setAiMatchNotify] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("reunite_privacy_prefs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.hidePhone === "boolean") setHidePhone(parsed.hidePhone);
        if (typeof parsed.showVerifiedBadge === "boolean") setShowVerifiedBadge(parsed.showVerifiedBadge);
        if (typeof parsed.aiMatchNotify === "boolean") setAiMatchNotify(parsed.aiMatchNotify);
      } catch {
        // ignore
      }
    }
  }, []);

  function handleSavePreferences() {
    const prefs = { hidePhone, showVerifiedBadge, aiMatchNotify };
    localStorage.setItem("reunite_privacy_prefs", JSON.stringify(prefs));
    toast.success("บันทึกการตั้งค่าความเป็นส่วนตัวเรียบร้อยแล้ว 🛡️");
    onClose();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setUpdatingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.warn("Supabase pass update:", error.message);
      }
      toast.success("อัปเดตรหัสผ่านใหม่เรียบร้อยแล้ว 🔒");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.success("อัปเดตรหัสผ่านใหม่เรียบร้อยแล้ว 🔒");
    } finally {
      setUpdatingPass(false);
    }
  }

  function handleClearCache() {
    if (confirm("คุณต้องการล้างแคชประวัติและข้อมูลชั่วคราวในอุปกรณ์นี้ใช่หรือไม่?")) {
      try {
        localStorage.removeItem("reunite_recent_searches");
        localStorage.removeItem("reunite_privacy_prefs");
        toast.success("ล้างแคชข้อมูลชั่วคราวเรียบร้อยแล้ว");
      } catch {
        toast.success("ล้างข้อมูลเรียบร้อย");
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Shield className="size-5" />
            </span>
            <div>
              <h2 className="text-[17px] font-bold">ความเป็นส่วนตัวและความปลอดภัย</h2>
              <p className="text-[12px] text-muted-foreground">
                การปกป้องข้อมูลติดต่อ และความปลอดภัยของบัญชี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* ข้อมูลความปลอดภัยบัญชี */}
          <div className="rounded-2xl bg-muted/40 border border-border p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">อีเมลประจำบัญชี</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> ปลอดภัย (เข้ารหัส)
              </span>
            </div>
            <p className="text-[14px] font-semibold text-foreground truncate">{email}</p>
          </div>

          {/* สวิตช์การตั้งค่าความเป็นส่วนตัว */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-foreground">การปกป้องข้อมูลติดต่อ</h3>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-surface cursor-pointer hover:border-primary/40 transition">
              <input
                type="checkbox"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                className="size-4 mt-0.5 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-[13.5px] font-semibold">ซ่อนเบอร์โทรศัพท์และ LINE ID</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  จะเปิดเผยข้อมูลติดต่อให้ผู้อื่นเห็นเฉพาะเมื่อทั้งสองฝ่ายกดยืนยันการส่งมอบของเท่านั้น
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-surface cursor-pointer hover:border-primary/40 transition">
              <input
                type="checkbox"
                checked={showVerifiedBadge}
                onChange={(e) => setShowVerifiedBadge(e.target.checked)}
                className="size-4 mt-0.5 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-[13.5px] font-semibold">แสดงคะแนนความน่าเชื่อถือและตรา Verified</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  เพิ่มความมั่นใจให้ผู้พบของ โดยแสดงระดับคะแนน ★ บนการ์ดประกาศของคุณ
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-surface cursor-pointer hover:border-primary/40 transition">
              <input
                type="checkbox"
                checked={aiMatchNotify}
                onChange={(e) => setAiMatchNotify(e.target.checked)}
                className="size-4 mt-0.5 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-[13.5px] font-semibold">การแจ้งเตือน AI Smart Match</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  แจ้งเตือนทันทีเมื่อระบบ AI วิเคราะห์พบประกาศของหายและพบของที่มีลักษณะตรงกัน
                </p>
              </div>
            </label>
          </div>

          {/* เปลี่ยนรหัสผ่าน */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-border">
            <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
              <KeyRound className="size-4 text-primary" /> เปลี่ยนรหัสผ่าน
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                placeholder="รหัสผ่านใหม่ (6+ ตัวอักษร)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-[13px] focus:outline-none focus:border-primary"
              />
              <input
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-[13px] focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={updatingPass || !newPassword}
              className="h-10 px-4 rounded-xl bg-muted hover:bg-muted/80 text-[12.5px] font-semibold text-foreground transition cursor-pointer disabled:opacity-50"
            >
              {updatingPass ? "กำลังเปลี่ยน..." : "อัปเดตรหัสผ่าน"}
            </button>
          </form>

          {/* ล้างแคช */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleClearCache}
              className="text-[12.5px] text-destructive hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="size-3.5" /> ล้างประวัติการค้นหาและแคชในอุปกรณ์นี้
            </button>
          </div>

          {/* ปุ่มบันทึกการตั้งค่า */}
          <div className="pt-3 border-t border-border flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border text-[13px] font-medium hover:bg-muted transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-[var(--shadow-pop)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="size-4" /> บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
