"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Loader2,
  Navigation,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  type Category,
  type PostType,
} from "@/lib/domain";

// Dynamically import MapPicker without SSR
const MapPicker = dynamic(
  () => import("@/components/map/map-picker").then((mod) => mod.MapPicker),
  { ssr: false }
);

const HUES: Record<Category, number> = {
  electronics: 195,
  wallet: 30,
  keys: 340,
  documents: 210,
  bag: 145,
  jewelry: 50,
  pet: 25,
  clothing: 280,
  other: 200,
};

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userId, loading } = useAuth();
  const [type, setType] = useState<PostType>("lost");
  const [category, setCategory] = useState<Category>("electronics");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marks, setMarks] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [happenedAt, setHappenedAt] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !userId) {
      router.push("/auth");
    }
  }, [loading, userId, router]);

  // Handle image file selection
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ภาพต้องไม่เกิน 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      toast.success("อัปโหลดรูปภาพตัวอย่างแล้ว");
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          type,
          category,
          title,
          description,
          marks,
          location_text: location,
          latitude: latitude,
          longitude: longitude,
          happened_at: happenedAt ? new Date(happenedAt).toISOString() : new Date().toISOString(),
          image_emoji: CATEGORY_EMOJI[category],
          image_hue: HUES[category],
          image_url: imageUrl,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("เผยแพร่ประกาศเรียบร้อย");
      router.push(`/post/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell hideTabs>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center cursor-pointer"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-[17px] font-semibold flex-1">สร้างประกาศใหม่</h1>
      </header>

      <form onSubmit={onSubmit} className="px-4 py-5 space-y-5">
        <section>
          <Label>ประเภทประกาศ</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <TypeTile
              active={type === "lost"}
              onClick={() => setType("lost")}
              emoji="🔎"
              title="แจ้งของหาย"
              desc="ฉันทำของหายและกำลังตามหา"
            />
            <TypeTile
              active={type === "found"}
              onClick={() => setType("found")}
              emoji="🤝"
              title="แจ้งพบของ"
              desc="ฉันพบของและอยากส่งคืน"
            />
          </div>
        </section>

        {/* Real Photo Upload Section */}
        <section>
          <div className="flex items-center justify-between">
            <Label>รูปภาพสิ่งของ</Label>
            <span className="text-[11.5px] text-muted-foreground">
              {imageUrl ? "มีรูปภาพแล้ว" : "ภาพถ่ายจริงช่วยให้พบของง่ายขึ้น"}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {imageUrl ? (
            <div className="relative mt-2 h-44 w-full rounded-2xl overflow-hidden border border-border bg-surface group">
              <img src={imageUrl} alt="ตัวอย่างรูปภาพ" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2.5 right-2.5 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer shadow-md"
                aria-label="ลบรูปภาพ"
              >
                <X className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2.5 right-2.5 h-8 px-3 rounded-full bg-surface/90 backdrop-blur border border-border text-[12px] font-medium text-foreground flex items-center gap-1.5 hover:bg-surface cursor-pointer shadow-md"
              >
                <Camera className="size-3.5 text-primary" /> เปลี่ยนรูป
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 h-28 w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-surface/50 hover:bg-primary-soft/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition"
            >
              <div className="size-10 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                <Camera className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-foreground">
                  แตะเพื่อถ่ายรูป หรือเลือกไฟล์ภาพ
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  (หากไม่เลือก จะใช้อีโมจิ {CATEGORY_EMOJI[category]} ประจำหมวดหมู่)
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <Label>หมวดหมู่</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition cursor-pointer ${
                  category === c
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                <span className="text-xl">{CATEGORY_EMOJI[c]}</span>
                <span className="text-[11.5px] font-medium text-center leading-tight px-1">
                  {CATEGORY_LABEL[c]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <Label htmlFor="title">หัวข้อ</Label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น พบ AirPods Pro สีขาว"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary"
          />
        </section>

        <section>
          <Label htmlFor="desc">รายละเอียด</Label>
          <textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="บอกบริบทเพิ่มเติม เช่น สถานการณ์ที่พบ/หาย"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary resize-none"
          />
        </section>

        <section>
          <Label htmlFor="marks">ตำหนิ / จุดสังเกต *</Label>
          <textarea
            id="marks"
            rows={2}
            required
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            placeholder="รายละเอียดที่เจ้าของของจริงเท่านั้นที่ตอบได้"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-accent/10 border border-accent/40 text-[14px] focus:outline-none focus:border-accent resize-none"
          />
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            ระบบจะใช้ข้อมูลนี้เพื่อยืนยันตัวเจ้าของจริง
          </p>
        </section>

        {/* Location & Interactive Map Pin */}
        <section>
          <div className="flex items-center justify-between">
            <Label>สถานที่</Label>
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="text-[12px] font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Navigation className="size-3.5" />
              {latitude && longitude ? "แก้ไขจุดปักหมุด" : "📍 ปักหมุดบนแผนที่"}
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <MapPin className="size-4 text-primary shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none text-foreground"
              placeholder="เช่น หน้าตึก 15, โรงอาหารกลาง"
            />
          </div>

          {/* If location has been pinned on map */}
          {latitude && longitude && (
            <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-primary-soft/60 border border-primary/20 text-[12px]">
              <span className="flex items-center gap-1.5 text-primary font-medium">
                📍 ปักหมุดพิกัดแล้ว ({latitude.toFixed(4)}, {longitude.toFixed(4)})
              </span>
              <button
                type="button"
                onClick={() => {
                  setLatitude(null);
                  setLongitude(null);
                }}
                className="text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="size-3" /> ลบหมุด
              </button>
            </div>
          )}
        </section>

        <section>
          <Label>วันเวลาที่เกิดเหตุ</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <Calendar className="size-4 text-primary shrink-0" />
            <input
              type="datetime-local"
              value={happenedAt}
              onChange={(e) => setHappenedAt(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none text-foreground"
            />
          </div>
        </section>

        <div className="pt-2 flex gap-2">
          <Link
            href="/"
            className="flex-1 h-12 rounded-xl border border-border bg-surface flex items-center justify-center font-medium"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            เผยแพร่ประกาศ
          </button>
        </div>
      </form>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          initialLat={latitude}
          initialLng={longitude}
          initialAddress={location}
          onSelect={(lat, lng, addressText) => {
            setLatitude(lat);
            setLongitude(lng);
            if (addressText && !location) {
              setLocation(addressText);
            }
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </AppShell>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
      {children}
    </label>
  );
}

function TypeTile({
  active,
  onClick,
  emoji,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-3 border transition cursor-pointer ${
        active ? "border-primary bg-primary-soft" : "border-border bg-surface"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <p className={`mt-1 font-semibold text-[13.5px] ${active ? "text-primary" : ""}`}>
        {title}
      </p>
      <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </button>
  );
}
