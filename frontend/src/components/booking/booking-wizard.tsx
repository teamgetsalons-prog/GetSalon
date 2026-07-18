"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  cn,
  formatDateKey,
  formatPKR,
  formatTime12h,
  toDateKey,
} from "@getsalons/shared/utils";
import { MAX_BOOKING_DAYS_AHEAD } from "@getsalons/shared/constants";
import type { TimeSlot } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/misc";

interface WizardSalon {
  _id: string;
  name: string;
  slug: string;
  cityName: string;
  address: string;
  coverImage: string;
}

interface WizardService {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  discountPrice?: number;
  isPopular?: boolean;
}

interface WizardDeal {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  serviceId: string | null;
  terms?: string;
}

const STEPS = ["Service", "Date & Time", "Confirm"] as const;

export function BookingWizard({
  salon,
  services,
  preselectedServiceId,
  deal,
}: {
  salon: WizardSalon;
  services: WizardService[];
  preselectedServiceId?: string;
  deal?: WizardDeal | null;
}) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(() => {
    // If deal has a linked service, auto-select it
    if (deal?.serviceId && services.some((s) => s._id === deal.serviceId)) {
      return deal.serviceId;
    }
    if (preselectedServiceId && services.some((s) => s._id === preselectedServiceId)) {
      return preselectedServiceId;
    }
    return null;
  });
  const [date, setDate] = useState<string>(toDateKey(new Date()));
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState("");
  const { user } = useAuth();
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  // Prefill the name from the account once it loads (still editable).
  useEffect(() => {
    if (user?.name) setContactName((v) => v || user.name);
  }, [user?.name]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ bookingNumber: string } | null>(null);

  const service = services.find((s) => s._id === serviceId) ?? null;

  // Next N days for the date strip
  const days = useMemo(() => {
    const out: string[] = [];
    const base = new Date();
    for (let i = 0; i <= MAX_BOOKING_DAYS_AHEAD; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(toDateKey(d));
    }
    return out;
  }, []);

  const loadSlots = useCallback(async () => {
    if (!serviceId) return;
    setLoadingSlots(true);
    setSlot(null);
    const params = new URLSearchParams({
      salonId: salon._id,
      serviceId,
      date,
    });
    const res = await api<TimeSlot[]>(`/api/bookings/availability?${params}`);
    setSlots(res.success && res.data ? res.data : []);
    setLoadingSlots(false);
  }, [salon._id, serviceId, date]);

  useEffect(() => {
    if (step === 1) void loadSlots();
  }, [step, loadSlots]);

  async function submit() {
    if (!service || !slot) return;
    // Friendly checks before the API sees anything.
    if (contactName.trim().length < 2) {
      setError("Please enter your name so the salon knows who's coming.");
      return;
    }
    if (!/^(\+?[1-9]\d{6,14}|0\d{9,10})$/.test(contactPhone.trim())) {
      setError("Please enter a valid phone number (e.g. 03XX XXXXXXX).");
      return;
    }
    if (contactEmail.trim() && !/^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
      setError("That email doesn't look right — fix it or leave it empty.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await api<{ bookingNumber: string }>("/api/bookings", {
      method: "POST",
      json: {
        salonId: salon._id,
        serviceId: service._id,
        date,
        startTime: slot.time,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim() || undefined,
        notes: notes || undefined,
      },
    });

    setSubmitting(false);
    if (res.success && res.data) {
      setDone({ bookingNumber: res.data.bookingNumber });
    } else {
      setError(res.message ?? "Booking failed — please try another slot.");
      if (res.message?.includes("slot")) void loadSlots();
    }
  }

  // ── Success screen ────────────────────────────────────────
  if (done) {
    return (
      <div className="animate-scale-in rounded-3xl border border-line bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <PartyPopper className="h-8 w-8 text-emerald-500" />
        </span>
        <h1 className="font-display mt-5 text-2xl font-bold sm:text-3xl">
          Booking request sent!
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          Your booking <span className="font-bold text-gold">{done.bookingNumber}</span>{" "}
          at <span className="font-semibold text-fg">{salon.name}</span> is
          awaiting confirmation. We&apos;ve emailed you the details.
        </p>

        <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl bg-bg-soft p-5 text-left text-sm">
          <SummaryRow label="Service" value={service?.name ?? ""} />
          {deal && service && deal.serviceId === service._id && (
            <SummaryRow label="Deal" value={deal.title} gold />
          )}
          <SummaryRow label="Specialist" value={slot?.staffName ?? "Any available"} />
          <SummaryRow label="Date" value={formatDateKey(date)} />
          <SummaryRow label="Time" value={slot ? formatTime12h(slot.time) : ""} />
          <SummaryRow
            label="Price"
            value={formatPKR(effectivePrice(service, deal))}
            gold
          />
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/bookings"
            className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-gold-950 hover:bg-gold-400"
          >
            View my bookings
          </Link>
          <Link
            href={`/salon/${salon.slug}`}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-fg-muted hover:text-fg"
          >
            Back to salon
          </Link>
        </div>
      </div>
    );
  }

  const canNext =
    (step === 0 && !!service) ||
    (step === 1 && !!slot) ||
    step === 2;

  return (
    <div>
      {/* Salon header */}
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
          <Image src={salon.coverImage} alt="" fill className="object-cover" sizes="56px" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-bold">{salon.name}</h1>
          <p className="flex items-center gap-1 text-xs text-fg-muted">
            <MapPin className="h-3 w-3" /> {salon.address}, {salon.cityName}
          </p>
        </div>
      </div>

      {/* Deal banner */}
      {deal && (
        <div className="mt-4 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <p className="text-sm font-semibold text-gold">{deal.title}</p>
            <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {deal.discountPercent}% OFF
            </span>
          </div>
          <p className="mt-1 text-xs text-fg-muted">{deal.description}</p>
          {deal.terms && <p className="mt-1 text-[11px] text-fg-faint">{deal.terms}</p>}
        </div>
      )}

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-1.5" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                i <= step ? "bg-gold-500" : "bg-line"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium sm:text-xs",
                i === step ? "text-gold" : "text-fg-faint"
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 min-h-72">
        {/* Step 1: service */}
        {step === 0 && (
          <div className="space-y-2.5">
            {services.length === 0 && (
              <p className="py-10 text-center text-sm text-fg-muted">
                This salon hasn&apos;t added bookable services yet.
              </p>
            )}
            {services.map((s) => (
              <button
                key={s._id}
                onClick={() => setServiceId(s._id)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all",
                  serviceId === s._id
                    ? "border-gold-500 bg-gold-500/8 ring-1 ring-gold-500/40"
                    : "border-line bg-card hover:border-gold-500/40"
                )}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {s.name}
                    {s.isPopular && <Sparkles className="h-3.5 w-3.5 text-gold" />}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-faint">
                    <Clock className="h-3 w-3" /> {s.duration} min
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {s.discountPrice && s.discountPrice < s.price && (
                    <p className="text-xs text-fg-faint line-through">
                      {formatPKR(s.price)}
                    </p>
                  )}
                  <p className="text-sm font-bold text-gold">
                    {formatPKR(effectivePrice(s, deal))}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: date & time */}
        {step === 1 && (
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-gold" /> Pick a date
            </p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => {
                const dt = new Date(`${d}T00:00:00`);
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    className={cn(
                      "flex w-16 shrink-0 cursor-pointer flex-col items-center rounded-xl border py-2.5 transition-all",
                      date === d
                        ? "border-gold-500 bg-gold-500/10 text-gold"
                        : "border-line bg-card text-fg-muted hover:border-gold-500/40"
                    )}
                  >
                    <span className="text-[10px] uppercase">
                      {dt.toLocaleDateString("en-PK", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-bold">{dt.getDate()}</span>
                    <span className="text-[10px]">
                      {dt.toLocaleDateString("en-PK", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2.5 mt-5 flex items-center gap-1.5 text-sm font-semibold">
              <Clock className="h-4 w-4 text-gold" /> Available slots
            </p>
            {loadingSlots ? (
              <Spinner className="py-8" />
            ) : slots.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line py-8 text-center text-sm text-fg-muted">
                No free slots on this day — try another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.minutes}
                    onClick={() => setSlot(s)}
                    className={cn(
                      "cursor-pointer rounded-xl border py-2.5 text-sm font-medium transition-all",
                      slot?.minutes === s.minutes
                        ? "border-gold-500 bg-gold-500 text-gold-950"
                        : "border-line bg-card text-fg-muted hover:border-gold-500/50"
                    )}
                  >
                    {formatTime12h(s.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: confirm */}
        {step === 2 && service && slot && (
          <div>
            <div className="space-y-2.5 rounded-2xl border border-line bg-card p-5 text-sm">
              <SummaryRow label="Service" value={service.name} />
              <SummaryRow
                label="Duration"
                value={`${service.duration} minutes`}
              />
              <SummaryRow
                label="Specialist"
                value={slot.staffName ?? "Any available"}
              />
              <SummaryRow label="Date" value={formatDateKey(date)} />
              <SummaryRow label="Time" value={formatTime12h(slot.time)} />
              <div className="border-t border-line pt-2.5">
                <SummaryRow
                  label="Total (pay at salon)"
                  value={formatPKR(effectivePrice(service, deal))}
                  gold
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-line bg-card p-4">
              <p className="text-sm font-semibold">Your contact details</p>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-fg-muted">
                  Name <span className="text-gold">*</span>
                </span>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-fg-muted">
                    Phone <span className="text-gold">*</span>
                  </span>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="03XX XXXXXXX"
                    autoComplete="tel"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-fg-muted">
                    Email (optional)
                  </span>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium">
                Notes for the salon (optional)
              </span>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the salon should know? Allergies, preferences…"
                maxLength={500}
              />
            </label>

            {error && (
              <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="mt-6 flex justify-between gap-3">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Link
            href={`/salon/${salon.slug}`}
            className="flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Link>
        )}

        {step < 2 ? (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button loading={submitting} onClick={submit}>
            <CheckCircle2 className="h-4 w-4" /> Confirm booking
          </Button>
        )}
      </div>
    </div>
  );
}

function effectivePrice(service: WizardService | null, deal?: WizardDeal | null): number {
  if (deal && service && deal.serviceId === service._id) {
    return deal.dealPrice;
  }
  if (!service) return 0;
  return service.discountPrice && service.discountPrice < service.price
    ? service.discountPrice
    : service.price;
}

function SummaryRow({
  label,
  value,
  gold,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-fg-faint">{label}</span>
      <span className={cn("font-semibold", gold ? "text-gold" : "text-fg")}>
        {value}
      </span>
    </div>
  );
}
