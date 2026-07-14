"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Approximate centers for the cities GetSalons currently covers, used only
 * to point the picker map somewhere sensible before an owner has placed a
 * pin. Falls back to Pakistan's rough center for any other city. */
const CITY_CENTERS: Record<string, [number, number]> = {
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
  faisalabad: [31.4504, 73.135],
  multan: [30.1575, 71.5249],
};
const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];

function defaultCenter(cityName?: string): [number, number] {
  if (!cityName) return PAKISTAN_CENTER;
  return CITY_CENTERS[cityName.toLowerCase()] ?? PAKISTAN_CENTER;
}

// Leaflet touches `window` at module load time, so it can only be imported
// on the client - ssr:false keeps it out of the server render entirely.
const MapInner = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-bg-soft text-sm text-fg-faint">
      Loading map…
    </div>
  ),
});

export function LocationPicker({
  cityName,
  latitude,
  longitude,
  onChange,
}: {
  cityName?: string;
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [locating, setLocating] = useState(false);
  const hasPin = latitude !== undefined && longitude !== undefined;
  const center: [number, number] = hasPin ? [latitude!, longitude!] : defaultCenter(cityName);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-fg-muted">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          {hasPin ? "Drag the pin or tap the map to adjust." : "Tap the map to place a pin at your salon's exact location."}
        </p>
        <Button type="button" size="sm" variant="outline" loading={locating} onClick={useMyLocation}>
          <LocateFixed className="h-3.5 w-3.5" /> Use my current location
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line" style={{ height: 280 }}>
        <MapInner center={center} pin={hasPin ? [latitude!, longitude!] : null} onPick={onChange} />
      </div>
      {hasPin && (
        <p className="mt-1.5 text-xs text-fg-faint">
          {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
        </p>
      )}
    </div>
  );
}
