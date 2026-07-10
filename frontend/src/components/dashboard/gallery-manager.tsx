"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { GalleryImage } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

/** Gallery items returned by the API carry their subdocument _id */
export type GalleryItem = GalleryImage & { _id?: string };

export function GalleryManager({
  salonId,
  initial,
}: {
  salonId: string;
  initial: GalleryItem[];
}) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", "gallery");

    const upload = await api<{ url: string; publicId: string }>("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!upload.success || !upload.data) {
      setUploading(false);
      setMessage(upload.message ?? "Upload failed.");
      return;
    }

    const attach = await api<GalleryItem[]>(`/api/salons/${salonId}/gallery`, {
      method: "POST",
      json: { url: upload.data.url, publicId: upload.data.publicId },
    });

    setUploading(false);
    if (attach.success && attach.data) {
      setImages(attach.data);
    } else {
      setMessage(attach.message ?? "Could not attach image.");
    }
  }

  async function remove(imageId: string | undefined) {
    if (!imageId) return;
    if (!window.confirm("Remove this photo from your gallery?")) return;
    const res = await api<GalleryItem[]>(
      `/api/salons/${salonId}/gallery/${imageId}`,
      { method: "DELETE" }
    );
    if (res.success && res.data) setImages(res.data);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gallery ({images.length})</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onFile}
        />
        <Button size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" /> Upload photo
        </Button>
      </div>

      {message && (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400">
          {message}
        </p>
      )}

      {images.length === 0 ? (
        <EmptyState
          title="Your gallery is empty"
          hint="Salons with 5+ photos get significantly more bookings. Show off your best work!"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.url} className="group relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={img.url}
                alt={img.caption || "Gallery photo"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <button
                onClick={() => remove(img._id)}
                aria-label="Delete photo"
                className="absolute right-2 top-2 cursor-pointer rounded-lg bg-black/60 p-2 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
