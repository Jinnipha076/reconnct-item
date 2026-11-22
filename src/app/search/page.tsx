"use client";

import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  MapPin,
  Calendar,
  RotateCcw,
  Navigation,
  Check,
  Clock,
  Sparkles,
  ArrowUpDown,
  History as HistoryIcon,
} from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase/client";
import { COMMUNITY_POSTS } from "@/lib/community-posts";
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  STATUS_LABEL,
  type Category,
  type PostRow,
  type PostStatus,
  type PostType,
} from "@/lib/domain";

// Haversine distance formula in kilometers
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const TIMEFRAMES = [
  { id: "all", label: "ทุกช่วงเวลา" },
  { id: "today", label: "วันนี้ (24 ชม.)" },
  { id: "3days", label: "3 วันล่าสุด" },
  { id: "7days", label: "สัปดาห์นี้ (7 วัน)" },
  { id: "30days", label: "เดือนนี้ (30 วัน)" },
] as const;

const RADIUS_OPTIONS = [
  { id: "all", label: "ไม่จำกัดระยะทาง" },
  { id: "1", label: "1 กม." },
  { id: "5", label: "5 กม." },
  { id: "10", label: "10 กม." },
  { id: "25", label: "25 กม." },
  { id: "50", label: "50 กม." },
] as const;

const SORT_OPTIONS = [
  { id: "newest", label: "ประกาศล่าสุด" },
  { id: "oldest", label: "ประกาศเก่าสุด" },
  { id: "distance", label: "ระยะทางใกล้สุด" },
] as const;

const POPULAR_KEYWORDS = [
  "กุญแจ",
  "AirPods",
  "กระเป๋าสตางค์",
  "บัตรประชาชน",
  "น้องแมว",
  "iPad",
  "สร้อย",
  "Honda",
];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const [q, setQ] = useState("");
  const [now, setNow] = useState(0);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Filters State
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]["id"]>("all");
  const [radiusKm, setRadiusKm] = useState<string>("all");
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["id"]>("newest");

  // User GPS coordinates
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    loading: boolean;
    error: string | null;
  }>({
    lat: 14.9962, // Default Buriram/Central Thailand
    lng: 103.1045,
    loading: false,
    error: null,
  });

  // Recent searches saved in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("reunite_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  function saveRecentSearch(keyword: string) {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 8);
      try {
        localStorage.setItem("reunite_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    try {
      localStorage.removeItem("reunite_recent_searches");
    } catch {
      // ignore
    }
  }

  // Request GPS Location
  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      setUserLocation((prev) => ({
        ...prev,
        error: "เบราว์เซอร์ไม่รองรับ GPS",
        loading: false,
      }));
      return;
    }

    setUserLocation((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          error: null,
        });
      },
      () => {
        setUserLocation((prev) => ({
          ...prev,
          loading: false,
          error: "ไม่สามารถเข้าถึงพิกัดได้ (ใช้ค่าเริ่มต้น)",
        }));
      },
      { timeout: 8000 }
    );
  }

  // Count active filters (excluding default)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (timeframe !== "all") count++;
    if (radiusKm !== "all") count++;
    if (sortBy !== "newest") count++;
    return count;
  }, [typeFilter, categoryFilter, statusFilter, timeframe, radiusKm, sortBy]);

  function resetAllFilters() {
    setTypeFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setTimeframe("all");
    setRadiusKm("all");
    setSortBy("newest");
  }

  // Fetch posts from Supabase + merge with community posts
  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ["search-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.warn("Supabase search query notice:", error.message);
        return COMMUNITY_POSTS;
      }
      return [...(data || []), ...COMMUNITY_POSTS];
    },
  });

  // Client-side filtering and sorting for maximum responsiveness
  const filteredResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    const currentMs = now || 0;

    return rawPosts
      .filter((post) => {
        // 1. Text Search Filter (Title, description, location_text, marks)
        if (term) {
          const matchTitle = post.title?.toLowerCase().includes(term);
          const matchDesc = post.description?.toLowerCase().includes(term);
          const matchLoc = post.location_text?.toLowerCase().includes(term);
          const matchMarks = post.marks?.toLowerCase().includes(term);
          if (!matchTitle && !matchDesc && !matchLoc && !matchMarks) {
            return false;
          }
        }

        // 2. Type Filter (lost vs found)
        if (typeFilter !== "all" && post.type !== typeFilter) {
          return false;
        }

        // 3. Category Filter
        if (categoryFilter !== "all" && post.category !== categoryFilter) {
          return false;
        }

        // 4. Status Filter
        if (statusFilter !== "all" && post.status !== statusFilter) {
          return false;
        }

        // 5. Timeframe Filter
        if (timeframe !== "all" && currentMs > 0) {
          const postTime = new Date(post.created_at).getTime();
          const ageMs = currentMs - postTime;
          if (timeframe === "today" && ageMs > 24 * 3600 * 1000) return false;
          if (timeframe === "3days" && ageMs > 3 * 24 * 3600 * 1000) return false;
          if (timeframe === "7days" && ageMs > 7 * 24 * 3600 * 1000) return false;
          if (timeframe === "30days" && ageMs > 30 * 24 * 3600 * 1000) return false;
        }

        // 6. Radius Distance Filter (GPS)
        if (radiusKm !== "all") {
          const maxDist = parseFloat(radiusKm);
          if (post.latitude && post.longitude) {
            const dist = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              post.latitude,
              post.longitude
            );
            if (dist > maxDist) return false;
          } else {
            // If post has no GPS coords, exclude from radius-strict filter
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "distance") {
          const distA =
            a.latitude && a.longitude
              ? calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
              : 99999;
          const distB =
            b.latitude && b.longitude
              ? calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
              : 99999;
          return distA - distB;
        }
        // Default: newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [
    rawPosts,
    q,
    typeFilter,
    categoryFilter,
    statusFilter,
    timeframe,
    radiusKm,
    sortBy,
    userLocation,
    now,
  ]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      saveRecentSearch(q.trim());
    }
  }

  function handleKeywordClick(kw: string) {
    setQ(kw);
    saveRecentSearch(kw);
  }

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 space-y-3 bg-background/95 backdrop-blur border-b border-border sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-bold">ค้นหาขั้นสูง</h1>
            <ThemeToggle />
          </div>

          {/* ช่องค้นหา + ปุ่มเปิดตัวกรอง */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3.5 h-11 rounded-2xl bg-surface border border-border focus-within:border-primary transition">
              <SearchIcon className="size-4 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาชื่อของ, ตำหนิ, สถานที่..."
                className="flex-1 bg-transparent text-[14px] focus:outline-none min-w-0"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* ปุ่มเปิดตัวกรองขั้นสูง */}
            <button
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className={`h-11 px-3.5 rounded-2xl border flex items-center gap-1.5 text-[13px] font-semibold transition cursor-pointer shrink-0 ${
                activeFiltersCount > 0
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-pop)]"
                  : "bg-surface border-border hover:border-primary/40 text-foreground"
              }`}
            >
              <SlidersHorizontal className="size-4" />
              <span>ตัวกรอง</span>
              {activeFiltersCount > 0 && (
                <span className="size-5 rounded-full bg-white text-primary text-[11px] font-bold flex items-center justify-center ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </form>

          {/* แถบตัวกรองเร่งด่วน (Quick Filter Chips) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-[12px]">
            {/* Type Quick Selector */}
            {(["all", "lost", "found"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-xl font-medium shrink-0 transition cursor-pointer border ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "ทั้งหมด" : t === "lost" ? "🔴 ของหาย" : "🟢 พบของ"}
              </button>
            ))}

            {/* Category Quick Selector Pill */}
            {categoryFilter !== "all" && (
              <button
                onClick={() => setCategoryFilter("all")}
                className="px-2.5 py-1 rounded-xl bg-accent/20 border border-accent text-accent-foreground font-medium shrink-0 flex items-center gap-1 text-[11.5px]"
              >
                <span>{CATEGORY_EMOJI[categoryFilter]} {CATEGORY_LABEL[categoryFilter]}</span>
                <X className="size-3" />
              </button>
            )}

            {/* Timeframe Quick Pill */}
            {timeframe !== "all" && (
              <button
                onClick={() => setTimeframe("all")}
                className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-medium shrink-0 flex items-center gap-1 text-[11.5px]"
              >
                <span>{TIMEFRAMES.find((tf) => tf.id === timeframe)?.label}</span>
                <X className="size-3" />
              </button>
            )}

            {/* Radius Quick Pill */}
            {radiusKm !== "all" && (
              <button
                onClick={() => setRadiusKm("all")}
                className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium shrink-0 flex items-center gap-1 text-[11.5px]"
              >
                <MapPin className="size-3" />
                <span>ภายใน {radiusKm} กม.</span>
                <X className="size-3" />
              </button>
            )}

            {/* Reset All Filters button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-muted-foreground hover:text-destructive text-[11.5px] px-2 py-1 shrink-0 flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="size-3" /> ล้างตัวกรอง
              </button>
            )}
          </div>
        </header>
      }
    >
      {/* ประวัติการค้นหาล่าสุด (Recent Searches) */}
      {recentSearches.length > 0 && !q && (
        <section className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-muted-foreground flex items-center gap-1 font-medium">
              <HistoryIcon className="size-3.5" /> ค้นหาล่าสุด
            </p>
            <button
              onClick={clearRecentSearches}
              className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer"
            >
              ล้างประวัติ
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleKeywordClick(term)}
                className="px-3 py-1 rounded-xl bg-muted/60 border border-border/80 text-[12px] text-foreground hover:border-primary/40 cursor-pointer transition"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ค้นหายอดนิยม (Popular Keywords) */}
      <section className="px-4 pt-4">
        <p className="text-[12px] text-muted-foreground mb-2 flex items-center gap-1 font-medium">
          <Sparkles className="size-3 text-amber-500" /> ค้นหายอดนิยมในชุมชน
        </p>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_KEYWORDS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleKeywordClick(tag)}
              className="px-3 py-1.5 rounded-xl bg-surface border border-border text-[12.5px] font-medium text-foreground hover:border-primary/40 cursor-pointer shadow-xs transition"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* รายการผลลัพธ์การค้นหา */}
      <section className="px-4 pt-5 pb-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] flex items-center gap-1.5">
            ผลการค้นหา
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {filteredResults.length}
            </span>
          </h2>

          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <ArrowUpDown className="size-3" />
            <span>
              {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-28 rounded-2xl bg-muted animate-pulse" />
            <div className="h-28 rounded-2xl bg-muted animate-pulse" />
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-3">
            <div className="size-14 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <p className="font-semibold text-[15px]">ไม่พบประกาศที่ตรงกับเงื่อนไข</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {q
                  ? `ไม่พบสิ่งที่ตรงกับ "${q}" ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองบางส่วน`
                  : "ลองปรับตัวกรองหมวดหมู่หรือขยายระยะทางค้นหา"}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[12.5px] font-medium shadow-sm cursor-pointer"
              >
                <RotateCcw className="size-3.5" /> ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          filteredResults.map((p) => {
            // Calculate distance if GPS is available
            const dist =
              p.latitude && p.longitude
                ? calculateDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
                : null;

            return (
              <div key={p.id} className="relative group">
                <PostCard post={p} />
                {dist !== null && (
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur text-[11px] font-semibold text-muted-foreground border border-border shadow-xs">
                      <MapPin className="size-3 text-primary" />
                      {dist < 1 ? `${Math.round(dist * 1000)} ม.` : `${dist} กม.`}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Modal หน้าต่างตัวกรองขั้นสูง (Advanced Filters Drawer/Modal) */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary-soft text-primary">
                  <SlidersHorizontal className="size-5" />
                </span>
                <div>
                  <h2 className="text-[17px] font-bold">ตัวกรองขั้นสูง</h2>
                  <p className="text-[12px] text-muted-foreground">
                    กำหนดเงื่อนไขการค้นหาให้แม่นยำยิ่งขึ้น
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1 text-[13px]">
              {/* 1. ประเภทประกาศ */}
              <div>
                <label className="font-bold text-foreground block mb-2">ประเภทประกาศ</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "ทั้งหมด" },
                    { id: "lost", label: "🔴 ของหาย" },
                    { id: "found", label: "🟢 พบของ" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTypeFilter(item.id as typeof typeFilter)}
                      className={`py-2 rounded-xl font-medium transition cursor-pointer border ${
                        typeFilter === item.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. หมวดหมู่สิ่งของ */}
              <div>
                <label className="font-bold text-foreground block mb-2">หมวดหมู่สิ่งของ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={`p-2.5 rounded-xl font-medium text-left transition cursor-pointer border flex items-center gap-2 ${
                      categoryFilter === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>✨</span>
                    <span>ทุกหมวดหมู่</span>
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`p-2.5 rounded-xl font-medium text-left transition cursor-pointer border flex items-center gap-2 truncate ${
                        categoryFilter === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-base">{CATEGORY_EMOJI[cat]}</span>
                      <span className="truncate">{CATEGORY_LABEL[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. รัศมีระยะทางจากตำแหน่งของคุณ (GPS Distance Radius) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary" /> รัศมีระยะทางรอบตัวคุณ
                  </label>
                  <button
                    type="button"
                    onClick={requestCurrentLocation}
                    className="text-[11.5px] text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Navigation className="size-3" />
                    {userLocation.loading ? "กำลังระบุพิกัด..." : "ดึงพิกัดปัจจุบัน"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRadiusKm(opt.id)}
                      className={`py-2 rounded-xl font-medium transition cursor-pointer border ${
                        radiusKm === opt.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. ช่วงเวลาที่เกิดเหตุ */}
              <div>
                <label className="font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <Calendar className="size-4 text-primary" /> ช่วงเวลาที่ลงประกาศ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTimeframe(tf.id)}
                      className={`py-2 px-2.5 rounded-xl font-medium transition cursor-pointer border text-center ${
                        timeframe === tf.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. สถานะเคส */}
              <div>
                <label className="font-bold text-foreground block mb-2">สถานะเคส</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "ทั้งหมด" },
                    { id: "searching", label: "🔍 กำลังตามหา" },
                    { id: "closed", label: "✅ ปิดเคสแล้ว" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatusFilter(st.id as typeof statusFilter)}
                      className={`py-2 rounded-xl font-medium transition cursor-pointer border ${
                        statusFilter === st.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. เรียงลำดับ */}
              <div>
                <label className="font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <ArrowUpDown className="size-4 text-primary" /> เรียงลำดับผลลัพธ์
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`py-2 rounded-xl font-medium transition cursor-pointer border text-center ${
                        sortBy === opt.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ปุ่มด้านล่าง Modal */}
            <div className="pt-3 border-t border-border mt-3 shrink-0 flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 h-11 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="size-3.5" /> ล้างทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="flex-2 h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold shadow-[var(--shadow-pop)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="size-4" /> ดูผลลัพธ์ ({filteredResults.length} รายการ)
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
