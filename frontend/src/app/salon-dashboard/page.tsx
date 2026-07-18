import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { getManagedSalon, getServerSession, serverFetch } from "@/lib/server-api";
import { StatCard } from "@/components/dashboard/shell";
import { BookingList } from "@/components/dashboard/booking-list";
import { NoSalonYet } from "@/components/dashboard/no-salon";
import { ProfileCompletion, type CompletionStep } from "@/components/dashboard/profile-completion";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SalonOverviewPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/salon-dashboard");

  const salon = await getManagedSalon();
  if (!salon) return <NoSalonYet />;

  const servicesRes = await serverFetch<unknown[]>(
    `/services?salonId=${salon._id}&all=1`
  );
  const serviceCount = servicesRes.data?.length ?? 0;

  const steps: CompletionStep[] = [
    {
      label: "Create your salon profile",
      done: true,
      href: "/salon-dashboard/settings",
      hint: "done at registration",
    },
    {
      label: "Add your services",
      done: serviceCount > 0,
      href: "/salon-dashboard/services",
      hint: "customers book from your menu",
    },
    {
      label: "Set your working hours",
      done: (salon.openingHours ?? []).some((h) => !h.isClosed),
      href: "/salon-dashboard/hours",
      hint: "controls your booking slots",
    },
    {
      label: "Upload a cover photo",
      done: Boolean(salon.coverImage) && !salon.coverImage.includes("unsplash.com"),
      href: "/salon-dashboard/gallery",
      hint: "your storefront on GetSalons",
    },
    {
      label: "Add gallery photos (3+)",
      done: (salon.gallery?.length ?? 0) >= 3,
      href: "/salon-dashboard/gallery",
      hint: "show off your best work",
    },
    {
      label: "Tell your story in About",
      done: (salon.about ?? "").trim().length >= 40,
      href: "/salon-dashboard/settings",
      hint: "why customers should choose you",
    },
    {
      label: "Add WhatsApp or social links",
      done: Boolean(
        salon.whatsapp ||
          salon.socials?.instagram ||
          salon.socials?.facebook ||
          salon.socials?.tiktok
      ),
      href: "/salon-dashboard/settings",
      hint: "let customers reach you anywhere",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5">
        <div>
          <p className="flex items-center gap-2 font-semibold">
            {salon.name}
            {salon.isVerified && <BadgeCheck className="h-4.5 w-4.5 text-gold" />}
          </p>
          <p className="mt-0.5 text-xs text-fg-muted">
            {salon.areaName ? `${salon.areaName}, ` : ""}
            {salon.cityName}
          </p>
        </div>
        {salon.status === "approved" ? (
          <Badge variant="success">Live on GetSalons</Badge>
        ) : salon.status === "pending" ? (
          <Badge variant="warning">Awaiting approval</Badge>
        ) : (
          <Badge variant="danger">
            {salon.status === "rejected" ? "Rejected" : "Suspended"}
          </Badge>
        )}
      </div>

      {salon.status === "rejected" && salon.rejectionReason && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          Rejection reason: {salon.rejectionReason} — update your profile and
          contact support to re-submit.
        </p>
      )}

      <ProfileCompletion steps={steps} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Rating"
          value={
            salon.rating.count > 0 ? `${salon.rating.average.toFixed(1)} ★` : "—"
          }
          icon="star"
          hint={`${salon.rating.count} verified reviews`}
        />
        <StatCard label="Profile views" value={salon.views ?? 0} icon="users" />
        <StatCard
          label="Gallery photos"
          value={salon.gallery?.length ?? 0}
          icon="images"
          hint="Salons with 5+ photos get more bookings"
        />
        <StatCard
          label="Status"
          value={salon.status === "approved" ? "Live" : salon.status}
          icon="store"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent bookings</h2>
        <BookingList role="salon" />
      </div>
    </div>
  );
}
