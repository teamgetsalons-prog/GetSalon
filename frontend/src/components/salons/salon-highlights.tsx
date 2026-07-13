import {
  BadgeCheck,
  CreditCard,
  Gem,
  Home,
  ParkingCircle,
  Snowflake,
  UserRound,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { SALON_AMENITIES } from "@getsalons/shared/constants";
import type { SalonAmenity } from "@getsalons/shared/types";

const AMENITY_ICONS: Record<SalonAmenity, LucideIcon> = {
  femaleStaff: UserRound,
  parking: ParkingCircle,
  ac: Snowflake,
  wifi: Wifi,
  cardAccepted: CreditCard,
  bridalSpecialist: Gem,
};

/** Below-the-hero checklist of salon amenities - quickly scannable, owner-selected. */
export function SalonHighlights({
  isVerified,
  homeService,
  amenities,
}: {
  isVerified: boolean;
  homeService: boolean;
  amenities?: SalonAmenity[];
}) {
  const items: { label: string; Icon: LucideIcon }[] = [];
  if (isVerified) items.push({ label: "Verified Salon", Icon: BadgeCheck });
  for (const a of amenities ?? []) {
    const meta = SALON_AMENITIES.find((x) => x.key === a);
    if (meta) items.push({ label: meta.label, Icon: AMENITY_ICONS[a] });
  }
  if (homeService) items.push({ label: "Home Service", Icon: Home });

  if (items.length === 0) return null;

  return (
    <section className="mt-5 animate-fade-in-up">
      <div className="flex flex-wrap gap-2">
        {items.map(({ label, Icon }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-fg-muted"
          >
            <Icon className="h-3.5 w-3.5 text-gold" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
