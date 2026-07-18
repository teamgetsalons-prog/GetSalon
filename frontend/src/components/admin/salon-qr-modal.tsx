"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { SITE } from "@getsalons/shared/constants";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/**
 * Per-salon QR code for print material (brochures, counter stands).
 * Scanning opens the salon's public profile, where customers can browse
 * services and leave reviews. High error-correction so it survives print.
 */
export function SalonQrModal({
  salon,
  onClose,
}: {
  salon: { name: string; slug: string } | null;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const url = salon ? `${SITE.url}/salon/${salon.slug}` : "";

  useEffect(() => {
    if (!salon) {
      setDataUrl(null);
      return;
    }
    let alive = true;
    QRCode.toDataURL(`${SITE.url}/salon/${salon.slug}`, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((u) => {
        if (alive) setDataUrl(u);
      })
      .catch(() => {
        if (alive) setDataUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [salon]);

  return (
    <Modal open={salon !== null} onClose={onClose} title={`QR code — ${salon?.name ?? ""}`}>
      <div className="flex flex-col items-center gap-4">
        {dataUrl ? (
          // Raw <img>: the source is a locally generated data URL, so
          // next/image optimization has nothing to add here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`QR code linking to ${salon?.name} on GetSalons`}
            className="h-56 w-56 rounded-xl border border-line bg-white p-2"
          />
        ) : (
          <div className="h-56 w-56 animate-pulse rounded-xl bg-bg-soft" />
        )}

        <p className="break-all text-center text-xs text-fg-muted">{url}</p>
        <p className="text-center text-xs text-fg-faint">
          Print this on brochures or counter stands — scanning opens the
          salon&apos;s profile where customers can book and leave reviews.
        </p>

        {dataUrl && (
          <a href={dataUrl} download={`getsalons-qr-${salon?.slug ?? "salon"}.png`}>
            <Button>
              <Download className="h-4 w-4" /> Download PNG
            </Button>
          </a>
        )}
      </div>
    </Modal>
  );
}
