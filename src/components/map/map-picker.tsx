"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Check, X, Loader2 } from "lucide-react";

interface MapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
  onSelect: (lat: number, lng: number, addressText?: string) => void;
  onClose: () => void;
}

export function MapPicker({
  initialLat,
  initialLng,
  initialAddress,
  onSelect,
  onClose,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default to Buriram / Thailand center or Bangkok if no coordinates
  const defaultLat = initialLat || 14.9951;
  const defaultLng = initialLng || 103.1029;

  const [selectedLat, setSelectedLat] = useState<number>(defaultLat);
  const [selectedLng, setSelectedLng] = useState<number>(defaultLng);
  const [addressName, setAddressName] = useState<string>(initialAddress || "");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [locating, setLocating] = useState(false);

  // Reverse geocoding using OpenStreetMap Nominatim (Free)
  async function reverseGeocode(lat: number, lng: number) {
    try {
      setLoadingAddress(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "th,en" } }
      );
      if (res.ok) {
        const data = await res.json();
        const displayName =
          data.name ||
          data.address?.suburb ||
          data.address?.city ||
          data.address?.road ||
          data.display_name?.split(",")[0] ||
          "";
        if (displayName) setAddressName(displayName);
      }
    } catch {
      // Ignore geocode error, user can type manually
    } finally {
      setLoadingAddress(false);
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([defaultLat, defaultLng], 15);
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Custom Cute Pin Icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          width: 38px;
          height: 38px;
          background: #0EA5A4;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

    const marker = L.marker([defaultLat, defaultLng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      setSelectedLat(position.lat);
      setSelectedLng(position.lng);
      void reverseGeocode(position.lat, position.lng);
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setSelectedLat(lat);
      setSelectedLng(lng);
      void reverseGeocode(lat, lng);
    });

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [defaultLat, defaultLng]);

  // Handle GPS location
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ไม่รองรับ GPS");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setSelectedLat(latitude);
        setSelectedLng(longitude);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        void reverseGeocode(latitude, longitude);
      },
      () => {
        setLocating(false);
        alert("ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้ กรุณากดเลือกจุดบนแผนที่ได้เลยครับ");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleConfirm() {
    onSelect(selectedLat, selectedLng, addressName);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-[440px] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[640px] border border-border">
        {/* Header */}
        <div className="px-4 py-3 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
            <div>
              <h2 className="font-bold text-[15px] leading-tight">ปักหมุดบนแผนที่</h2>
              <p className="text-[11px] text-muted-foreground">แตะหรือลากหมุดไปยังจุดที่ต้องการ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 w-full bg-muted">
          <div ref={mapContainerRef} className="size-full" />

          {/* GPS My Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="absolute bottom-4 right-4 z-[400] h-10 px-3 rounded-full bg-surface/95 backdrop-blur-md border border-border shadow-lg flex items-center gap-1.5 text-[12px] font-medium text-foreground hover:bg-surface cursor-pointer"
          >
            {locating ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Navigation className="size-3.5 text-primary" />
            )}
            ตำแหน่งฉัน
          </button>
        </div>

        {/* Footer info & confirm */}
        <div className="p-4 bg-surface border-t border-border space-y-3">
          <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-xl border border-border text-[12.5px]">
            <span className="text-primary font-semibold shrink-0">จุดที่เลือก:</span>
            <input
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              placeholder={loadingAddress ? "กำลังค้นหาชื่อสถานที่..." : "พิมพ์ชื่อสถานที่หรือจุดสังเกต"}
              className="flex-1 bg-transparent focus:outline-none truncate text-foreground"
            />
            {loadingAddress && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border font-medium text-[13px] hover:bg-muted cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-[2] h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-[13px] shadow-[var(--shadow-pop)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="size-4" /> ยืนยันพิกัดนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
