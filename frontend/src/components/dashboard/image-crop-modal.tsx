"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCroppedImageFile } from "@/lib/crop-image";

/**
 * Full-screen crop step inserted between file-pick and upload, so owners
 * can frame logo/cover photos themselves instead of getting stuck with
 * whatever crop the browser's default object-fit produces.
 */
export function ImageCropModal({
  file,
  aspect,
  title,
  onCancel,
  onCropped,
}: {
  file: File;
  aspect: number;
  title: string;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function confirm() {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const cropped = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        file.name,
        file.type || "image/jpeg"
      );
      onCropped(cropped);
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="cursor-pointer rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex-1">
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-black/95 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-white/70" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-gold-500"
            aria-label="Zoom"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={confirm} loading={busy}>
            Use this photo
          </Button>
        </div>
      </div>
    </div>
  );
}
