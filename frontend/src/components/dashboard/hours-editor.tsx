"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { DAYS } from "@getsalons/shared/constants";
import type { OpeningHour } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HoursEditor({
  salonId,
  initial,
}: {
  salonId: string;
  initial: OpeningHour[];
}) {
  const [hours, setHours] = useState<OpeningHour[]>(() =>
    Array.from({ length: 7 }, (_, day) => {
      const existing = initial.find((h) => h.day === day);
      return (
        existing ?? { day, open: "10:00", close: "21:00", isClosed: false }
      );
    })
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update(day: number, patch: Partial<OpeningHour>) {
    setHours((hs) => hs.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await api(`/api/salons/${salonId}`, {
      method: "PATCH",
      json: { openingHours: hours },
    });
    setSaving(false);
    setMessage(
      res.success ? "Working hours updated." : res.message ?? "Could not save."
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold">Working hours</h2>
      <div className="divide-y divide-line rounded-2xl border border-line bg-card">
        {hours.map((h) => (
          <div
            key={h.day}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <label className="flex w-36 cursor-pointer items-center gap-2.5 text-sm font-medium">
              <input
                type="checkbox"
                checked={!h.isClosed}
                onChange={(e) => update(h.day, { isClosed: !e.target.checked })}
                className="h-4 w-4 accent-[#d4941f]"
              />
              {DAYS[h.day]}
            </label>
            {h.isClosed ? (
              <span className="text-sm text-fg-faint">Closed</span>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={h.open}
                  onChange={(e) => update(h.day, { open: e.target.value })}
                  className="w-32"
                  aria-label={`${DAYS[h.day]} opening time`}
                />
                <span className="text-fg-faint">–</span>
                <Input
                  type="time"
                  value={h.close}
                  onChange={(e) => update(h.day, { close: e.target.value })}
                  className="w-32"
                  aria-label={`${DAYS[h.day]} closing time`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {message && <p className="mt-3 text-sm text-gold">{message}</p>}

      <Button className="mt-4" loading={saving} onClick={save}>
        Save working hours
      </Button>
      <p className="mt-2 text-xs text-fg-faint">
        These are your salon&apos;s default hours. Individual staff schedules
        and leave days are managed in the Staff section.
      </p>
    </div>
  );
}
