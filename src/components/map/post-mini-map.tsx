"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, MapPin } from "lucide-react";

interface PostMiniMapProps {
  lat: number;
  lng: number;
  title: string;
  type: "lost" | "found";
  locationText?: string;
}

export function PostMiniMap({ lat, lng, title, type, locationText }: PostMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: !L.Browser.mobile,
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const isLost = type === "lost";
    const pinColor = isLost ? "#EF4444" : "#0EA5A4";

    const customIcon = L.divIcon({
      className: "mini-map-pin",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${pinColor};
          border: 2.5px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">${isLost ? "🔎" : "🤝"}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, title, type]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden space-y-2">
      <div className="relative h-44 w-full bg-muted">
        <div ref={containerRef} className="size-full" />
      </div>

      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground truncate">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span className="truncate">{locationText || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[12px] font-medium text-primary hover:underline flex items-center gap-1"
        >
          เปิดใน Google Maps <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
