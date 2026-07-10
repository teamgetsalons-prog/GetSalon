"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { api } from "@/lib/api";
import {
  cn,
  formatDateKey,
  formatPKR,
  formatTime12h,
  toDateKey,
} from "@getsalons/shared/utils";
import type { BookingStatus, TimeSlot } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { Textarea } from "@/components/ui/input";
import { StarPicker } from "@/components/ui/star-rating";
import { MAX_BOOKING_DAYS_AHEAD } from "@getsalons/shared/constants";

export interface BookingRow {
  _id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  serviceSnapshot: { name: string; duration: number };
  service: string;
  salon?: { _id: string; name: string; slug: string; cityName?: string };
  customer?: { name?: string; phone?: string };
  staff?: { name?: string };
}

type ViewerRole = "customer" | "salon" | "admin";
type Tab = "upcoming" | "past" | "all";

export function BookingList({ role }: { role: ViewerRole }) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reviewFor, setReviewFor] = useState<BookingRow | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<BookingRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (tab !== "all") params.set("scope", tab);
    const res = await api<BookingRow[]>(`/api/bookings?${params}`);
    setRows(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(
    booking: BookingRow,
    action: "confirm" | "complete" | "cancel" | "no_show"
  ) {
    if (
      action === "cancel" &&
      !window.confirm(`Cancel booking ${booking.bookingNumber}?`)
    ) {
      return;
    }
    setBusy(booking._id);
    setMessage(null);
    const res = await api(`/api/bookings/${booking._id}`, {
      method: "PATCH",
      json: { action },
    });
    setBusy(null);
    setMessage(res.message ?? null);
    if (res.success) void load();
  }

  const isFuture = (b: BookingRow) =>
    b.date > toDateKey(new Date()) ||
    (b.date === toDateKey(new Date()) &&
      b.startTime > new Date().toTimeString().slice(0, 5));

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["upcoming", "past", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors",
              tab === t
                ? "border-gold-500 bg-gold-500/15 text-gold"
                : "border-line text-fg-muted hover:text-fg"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-4 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 text-sm text-gold">
          {message}
        </p>
      )}

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No bookings here"
          hint={
            role === "customer"
              ? "Find a great salon and book your first appointment."
              : "Bookings from customers will appear here."
          }
          action={
            role === "customer" ? (
              <Link
                href="/salons"
                className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-gold-950 hover:bg-gold-400"
              >
                Browse salons
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {b.serviceSnapshot.name}
                    <BookingStatusBadge status={b.status} />
                  </p>
                  <p className="mt-1 text-xs text-fg-muted">
                    {role === "customer" ? (
                      <Link
                        href={`/salon/${b.salon?.slug}`}
                        className="hover:text-gold"
                      >
                        {b.salon?.name}
                      </Link>
                    ) : (
                      <>
                        {b.customer?.name ?? "Customer"}
                        {b.customer?.phone ? ` · ${b.customer.phone}` : ""}
                      </>
                    )}
                    {b.staff?.name ? ` · with ${b.staff.name}` : ""}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-fg-faint">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateKey(b.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime12h(b.startTime)} · {b.serviceSnapshot.duration} min
                    </span>
                    <span className="font-mono">{b.bookingNumber}</span>
                  </p>
                </div>
                <p className="text-sm font-bold text-gold">{formatPKR(b.price)}</p>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                {role === "customer" ? (
                  <>
                    {["pending", "confirmed"].includes(b.status) && isFuture(b) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busy === b._id}
                          onClick={() => setRescheduleFor(b)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          loading={busy === b._id}
                          onClick={() => act(b, "cancel")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {b.status === "completed" && (
                      <Button size="sm" onClick={() => setReviewFor(b)}>
                        Write a review
                      </Button>
                    )}
                    {b.status === "cancelled" && b.salon && (
                      <Link
                        href={`/book/${b.salon.slug}`}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg-muted hover:text-gold"
                      >
                        Book again
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    {b.status === "pending" && (
                      <Button
                        size="sm"
                        loading={busy === b._id}
                        onClick={() => act(b, "confirm")}
                      >
                        Confirm
                      </Button>
                    )}
                    {["pending", "confirmed"].includes(b.status) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={busy === b._id}
                          onClick={() => act(b, "complete")}
                        >
                          Mark completed
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={busy === b._id}
                          onClick={() => act(b, "no_show")}
                        >
                          No-show
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          loading={busy === b._id}
                          onClick={() => act(b, "cancel")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewFor && (
        <ReviewModal
          booking={reviewFor}
          onClose={() => setReviewFor(null)}
          onDone={() => {
            setReviewFor(null);
            setMessage("Thanks! Your review is live.");
          }}
        />
      )}

      {rescheduleFor && (
        <RescheduleModal
          booking={rescheduleFor}
          onClose={() => setRescheduleFor(null)}
          onDone={() => {
            setRescheduleFor(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

// ── Review modal ──────────────────────────────────────────────
function ReviewModal({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    const res = await api("/api/reviews", {
      method: "POST",
      json: { appointmentId: booking._id, rating, comment },
    });
    setSaving(false);
    if (res.success) onDone();
    else setError(res.message ?? "Could not submit review.");
  }

  return (
    <Modal open onClose={onClose} title={`Review ${booking.salon?.name ?? "your visit"}`}>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">How was your experience?</p>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about the service, staff, cleanliness… (min 10 characters)"
          rows={4}
          maxLength={2000}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          className="w-full"
          loading={saving}
          disabled={comment.trim().length < 10}
          onClick={submit}
        >
          Publish review
        </Button>
      </div>
    </Modal>
  );
}

// ── Reschedule modal ─────────────────────────────────────────
function RescheduleModal({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState(booking.date);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = (() => {
    const out: string[] = [];
    const base = new Date();
    for (let i = 0; i <= MAX_BOOKING_DAYS_AHEAD; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      out.push(toDateKey(d));
    }
    return out;
  })();

  const loadSlots = useCallback(async () => {
    if (!booking.salon?._id) return;
    setLoading(true);
    setSlot(null);
    const params = new URLSearchParams({
      salonId: booking.salon._id,
      serviceId: booking.service,
      date,
    });
    const res = await api<TimeSlot[]>(`/api/bookings/availability?${params}`);
    setSlots(res.success && res.data ? res.data : []);
    setLoading(false);
  }, [booking.salon?._id, booking.service, date]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  async function submit() {
    if (!slot) return;
    setSaving(true);
    setError(null);
    const res = await api(`/api/bookings/${booking._id}`, {
      method: "PATCH",
      json: { action: "reschedule", date, startTime: slot.time },
    });
    setSaving(false);
    if (res.success) onDone();
    else setError(res.message ?? "Could not reschedule.");
  }

  return (
    <Modal open onClose={onClose} title="Reschedule booking" wide>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const dt = new Date(`${d}T00:00:00`);
          return (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={cn(
                "flex w-14 shrink-0 cursor-pointer flex-col items-center rounded-xl border py-2 text-xs transition-colors",
                date === d
                  ? "border-gold-500 bg-gold-500/10 text-gold"
                  : "border-line text-fg-muted"
              )}
            >
              <span className="text-[10px] uppercase">
                {dt.toLocaleDateString("en-PK", { weekday: "short" })}
              </span>
              <span className="text-base font-bold">{dt.getDate()}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Spinner className="py-6" />
      ) : slots.length === 0 ? (
        <p className="py-6 text-center text-sm text-fg-muted">
          No free slots this day — try another date.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((s) => (
            <button
              key={s.minutes}
              onClick={() => setSlot(s)}
              className={cn(
                "cursor-pointer rounded-xl border py-2 text-xs font-medium transition-colors",
                slot?.minutes === s.minutes
                  ? "border-gold-500 bg-gold-500 text-gold-950"
                  : "border-line text-fg-muted hover:border-gold-500/50"
              )}
            >
              {formatTime12h(s.time)}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <Button
        className="mt-4 w-full"
        disabled={!slot}
        loading={saving}
        onClick={submit}
      >
        Confirm new time
      </Button>
    </Modal>
  );
}
