"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./salon-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-2xl border border-line bg-bg-soft text-xs text-fg-faint">
      Loading map…
    </div>
  ),
});

export function SalonMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line" style={{ height: 192 }}>
      <MapInner lat={lat} lng={lng} name={name} />
    </div>
  );
}
