"use client";

import { useState } from "react";
import { cn } from "@getsalons/shared/utils";
import {
  SalonSettingsForm,
  type SalonSettingsData,
} from "@/components/dashboard/salon-settings-form";
import {
  ServicesManager,
  type ServiceRow,
} from "@/components/dashboard/services-manager";
import {
  GalleryManager,
  type GalleryItem,
} from "@/components/dashboard/gallery-manager";

const TABS = ["Details", "Services", "Photos"] as const;
type Tab = (typeof TABS)[number];

/**
 * Admin view of one salon/branch, reusing the exact same editors the owner
 * dashboard uses (settings form, services manager, gallery manager) - the
 * backend endpoints they call already permit admins, so admin edits behave
 * identically to the owner's own.
 */
export function SalonManageTabs({
  salonId,
  settingsInitial,
  categories,
  services,
  coverImage,
  logo,
  gallery,
}: {
  salonId: string;
  settingsInitial: SalonSettingsData;
  categories: { _id: string; name: string }[];
  services: ServiceRow[];
  coverImage?: string;
  logo?: string;
  gallery: GalleryItem[];
}) {
  const [tab, setTab] = useState<Tab>("Details");

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              tab === t
                ? "border-gold-500 bg-gold-500/15 text-gold"
                : "border-line text-fg-muted hover:text-fg"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <SalonSettingsForm
          salonId={salonId}
          categories={categories}
          initial={settingsInitial}
        />
      )}
      {tab === "Services" && (
        <ServicesManager
          salonId={salonId}
          categories={categories}
          initial={services}
        />
      )}
      {tab === "Photos" && (
        <GalleryManager
          salonId={salonId}
          initialCover={coverImage}
          initialLogo={logo}
          initial={gallery}
        />
      )}
    </div>
  );
}
