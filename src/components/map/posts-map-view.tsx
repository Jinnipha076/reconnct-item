"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { type PostRow, CATEGORY_EMOJI, CATEGORY_LABEL, relativeTime } from "@/lib/domain";
import { TypeBadge, StatusBadge } from "@/components/badges";
import { Navigation, Loader2 } from "lucide-react";

interface PostsMapViewProps {
  posts: PostRow[];
}

export function PostsMapView({ posts }: PostsMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activePost, setActivePost] = useState<PostRow | null>(null);
  const [locating, setLocating] = useState(false);

  // Filter posts that have valid lat and lng
  const geoPosts = posts.filter(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default center Thailand / Buriram / Bangkok
    const defaultCenter: [number, number] = geoPosts.length > 0
      ? [geoPosts[0].latitude!, geoPosts[0].longitude!]
      : [14.9951, 103.1029];

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView(defaultCenter, geoPosts.length > 0 ? 13 : 11);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when geoPosts changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (geoPosts.length === 0) return;

    const bounds = L.latLngBounds([]);

    geoPosts.forEach((p) => {
      const lat = p.latitude!;
      const lng = p.longitude!;
      bounds.extend([lat, lng]);

      const isLost = p.type === "lost";
      const pinColor = isLost ? "#EF4444" : "#0EA5A4";
      const emoji = CATEGORY_EMOJI[p.category] || (isLost ? "🔎" : "🤝");

      const icon = L.divIcon({
        className: "custom-feed-pin",
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: ${pinColor};
            border: 2.5px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.28);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(markersLayerRef.current!);

      marker.on("click", () => {
        setActivePost(p);
        mapRef.current?.setView([lat, lng], 15, { animate: true });
      });
    });

    if (geoPosts.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [geoPosts]);

  function handleLocateMe() {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        mapRef.current?.setView([latitude, longitude], 15, { animate: true });

        // Add a blue pulse dot for user location
        const myIcon = L.divIcon({
          className: "user-gps-pulse",
          html: `<div style="width: 16px; height: 16px; background: #3B82F6; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 12px #3B82F6;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([latitude, longitude], { icon: myIcon }).addTo(mapRef.current!);
      },
      () => {
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="relative w-full h-[65vh] min-h-[420px] rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-card)]">
      {/* Map DOM */}
      <div ref={containerRef} className="size-full" />

      {/* GPS Button */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={locating}
        className="absolute top-3 right-3 z-[400] size-10 rounded-full bg-surface/95 backdrop-blur border border-border shadow-md flex items-center justify-center text-foreground hover:bg-surface cursor-pointer"
        aria-label="ตำแหน่งปัจจุบัน"
      >
        {locating ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          <Navigation className="size-4 text-primary" />
        )}
      </button>

      {/* Notice if no geo posts */}
      {geoPosts.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] px-4 py-2 rounded-full bg-surface/90 backdrop-blur border border-border text-[12px] text-muted-foreground shadow-md whitespace-nowrap">
          📍 ยังไม่มีประกาศที่ปักหมุดพิกัดในบริเวณนี้
        </div>
      )}

      {/* Selected Post Bottom Sheet Card */}
      {activePost && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-surface rounded-2xl border border-border p-3.5 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-3">
            <div
              className="size-14 shrink-0 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `oklch(0.94 0.05 ${activePost.image_hue})` }}
            >
              {activePost.image_url ? (
                <img src={activePost.image_url} alt="" className="size-full object-cover rounded-xl" />
              ) : (
                activePost.image_emoji
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <TypeBadge type={activePost.type} />
                <StatusBadge status={activePost.status} />
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {relativeTime(activePost.created_at)}
                </span>
              </div>

              <h4 className="font-semibold text-[14px] truncate mt-1 text-foreground">
                {activePost.title}
              </h4>
              <p className="text-[11.5px] text-muted-foreground truncate">
                {CATEGORY_EMOJI[activePost.category]} {CATEGORY_LABEL[activePost.category]} • {activePost.location_text || "ไม่ระบุชื่อจุด"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setActivePost(null)}
              className="px-3 py-1.5 rounded-xl border border-border text-[12px] font-medium text-muted-foreground hover:bg-muted"
            >
              ปิด
            </button>
            <Link
              href={`/post/${activePost.id}`}
              className="flex-1 py-1.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-semibold text-center flex items-center justify-center shadow-sm"
            >
              ดูรายละเอียดประกาศนี้ →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
