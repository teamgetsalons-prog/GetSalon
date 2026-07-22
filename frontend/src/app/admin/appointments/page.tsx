"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Download } from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatPKR, formatTime12h, toDateKey } from "@getsalons/shared/utils";
import type { BookingStatus, SalonStatus } from "@getsalons/shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface SalonOption {
  _id: string;
  name: string;
  cityName: string;
  status: SalonStatus;
  phone: string;
  ownerId: string;
  ownerName: string;
}

interface AdminBookingRow {
  _id: string;
  bookingNumber: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  startMinutes: number;
  price: number;
  status: BookingStatus;
  serviceSnapshot: { name: string; duration: number; price: number };
  salon?: { _id?: string; name?: string; cityName?: string } | null;
  customer?: { name?: string; phone?: string } | null;
  contact?: { name?: string; phone?: string; email?: string };
  staff?: { name?: string } | null;
}

const statusTabs: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

const statusVariant: Record<BookingStatus, "warning" | "success" | "gold" | "danger" | "neutral"> = {
  pending: "warning",
  confirmed: "success",
  completed: "gold",
  cancelled: "danger",
  no_show: "neutral",
};

function customerName(row: AdminBookingRow): string {
  return row.contact?.name || row.customer?.name || "—";
}

function customerPhone(row: AdminBookingRow): string {
  return row.contact?.phone || row.customer?.phone || "—";
}

export default function AdminAppointmentsPage() {
  const [salonId, setSalonId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminBookingRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SalonOption[]>([]);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await api<SalonOption[]>("/api/admin/salons/options");
      setOptions(res.success && res.data ? res.data : []);
    })();
  }, []);

  const buildParams = useCallback(
    (forPage: number) => {
      const params = new URLSearchParams({ limit: "50", page: String(forPage) });
      if (salonId) params.set("salonId", salonId);
      if (date) params.set("date", date);
      if (status) params.set("status", status);
      return params;
    },
    [salonId, date, status]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<AdminBookingRow[]>(`/api/bookings?${buildParams(page)}`);
    setRows(res.success && res.data ? res.data : []);
    setTotalPages(res.pagination?.totalPages ?? 1);
    setTotal(res.pagination?.total ?? 0);
    setLoading(false);
  }, [buildParams, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Owners with several branches get their locations grouped together so
  // each branch's appointments are clearly dealt with separately.
  const grouped = useMemo(() => {
    const byOwner = new Map<string, SalonOption[]>();
    for (const o of options) {
      const list = byOwner.get(o.ownerId) ?? [];
      list.push(o);
      byOwner.set(o.ownerId, list);
    }
    const multi = [...byOwner.values()]
      .filter((g) => g.length > 1)
      .sort((a, b) => a[0]!.name.localeCompare(b[0]!.name));
    const singles = [...byOwner.values()]
      .filter((g) => g.length === 1)
      .map((g) => g[0]!)
      .sort((a, b) => a.name.localeCompare(b.name));
    return { multi, singles };
  }, [options]);

  function setFilter(update: () => void) {
    update();
    setPage(1);
  }

  const salonLabel = salonId
    ? options.find((o) => o._id === salonId)?.name ?? "Selected salon"
    : "All salons";

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      // The PDF covers the WHOLE current filter, not just the visible page.
      const all: AdminBookingRow[] = [];
      let p = 1;
      let pages = 1;
      do {
        const res = await api<AdminBookingRow[]>(`/api/bookings?${buildParams(p)}`);
        if (!res.success || !res.data) break;
        all.push(...res.data);
        pages = res.pagination?.totalPages ?? 1;
        p++;
      } while (p <= pages && p <= 20); // safety cap: 1,000 rows

      // Chronological reads best on paper.
      all.sort((a, b) =>
        a.date === b.date ? a.startMinutes - b.startMinutes : a.date.localeCompare(b.date)
      );

      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "landscape" });

      const statusLabel = statusTabs.find((t) => t.value === status)?.label ?? "All";
      doc.setFontSize(16);
      doc.text("GetSalons — Appointments", 14, 16);
      doc.setFontSize(10);
      doc.setTextColor(110);
      doc.text(
        `${salonLabel}${date ? ` · ${date}` : " · all dates"} · ${statusLabel} · ${all.length} appointment${all.length === 1 ? "" : "s"}`,
        14,
        23
      );
      doc.text(`Generated ${new Date().toLocaleString("en-PK")}`, 14, 28);

      const withSalonColumn = !salonId;
      autoTable(doc, {
        startY: 33,
        head: [
          [
            ...(withSalonColumn ? ["Salon"] : []),
            "Date",
            "Time",
            "Booking #",
            "Customer",
            "Phone",
            "Service",
            "Duration",
            "Price",
            "Status",
          ],
        ],
        body: all.map((r) => [
          ...(withSalonColumn ? [r.salon?.name ?? "—"] : []),
          r.date,
          formatTime12h(r.startTime),
          r.bookingNumber,
          customerName(r),
          customerPhone(r),
          r.serviceSnapshot?.name ?? "—",
          `${r.serviceSnapshot?.duration ?? "—"} min`,
          formatPKR(r.price),
          r.status.replace("_", " "),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [180, 130, 30] },
      });

      const fileSalon = salonLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      doc.save(`appointments-${fileSalon}-${date || "all-dates"}.pdf`);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-fg-muted">
        Every booking across GetSalons. Filter by salon or branch and by
        date, then download the list as a PDF to send to the salon owner.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(() => setStatus(t.value))}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              status === t.value
                ? "border-gold-500 bg-gold-500/15 text-gold"
                : "border-line text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={salonId}
          onChange={(e) => setFilter(() => setSalonId(e.target.value))}
          className="h-9 w-full sm:w-72"
        >
          <option value="">All salons</option>
          {grouped.multi.map((group) => (
            <optgroup
              key={group[0]!.ownerId}
              label={`${group[0]!.ownerName || group[0]!.name} — ${group.length} branches`}
            >
              {group.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} — {o.cityName}
                  {o.status !== "approved" ? ` (${o.status})` : ""}
                </option>
              ))}
            </optgroup>
          ))}
          {grouped.singles.length > 0 &&
            (grouped.multi.length > 0 ? (
              <optgroup label="Other salons">
                {grouped.singles.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} — {o.cityName}
                    {o.status !== "approved" ? ` (${o.status})` : ""}
                  </option>
                ))}
              </optgroup>
            ) : (
              grouped.singles.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} — {o.cityName}
                  {o.status !== "approved" ? ` (${o.status})` : ""}
                </option>
              ))
            ))}
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => setFilter(() => setDate(e.target.value))}
          className="h-9 w-full sm:w-44"
          aria-label="Filter by date"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilter(() => setDate(toDateKey(new Date())))}
        >
          <CalendarDays className="h-3.5 w-3.5" /> Today
        </Button>
        {(date || salonId || status) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setFilter(() => {
                setDate("");
                setSalonId("");
                setStatus("");
              })
            }
          >
            Clear filters
          </Button>
        )}

        <Button
          size="sm"
          className="ml-auto"
          loading={pdfBusy}
          onClick={() => void downloadPdf()}
          disabled={total === 0}
        >
          <Download className="h-3.5 w-3.5" /> Download PDF
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No appointments match these filters"
          hint="Try another date, salon or status."
        />
      ) : (
        <>
          <p className="mb-2 text-xs text-fg-muted">
            {total} appointment{total === 1 ? "" : "s"} · {salonLabel}
            {date ? ` · ${date}` : ""}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-fg-muted">
                  {!salonId && <th className="px-4 py-3 font-medium">Salon</th>}
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Booking #</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r._id}>
                    {!salonId && (
                      <td className="px-4 py-3">
                        <span className="font-medium">{r.salon?.name ?? "—"}</span>
                        {r.salon?.cityName && (
                          <span className="block text-xs text-fg-faint">{r.salon.cityName}</span>
                        )}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatTime12h(r.startTime)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-fg-muted">
                      {r.bookingNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{customerName(r)}</span>
                      <span className="block text-xs text-fg-faint">{customerPhone(r)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.serviceSnapshot?.name ?? "—"}
                      <span className="block text-xs text-fg-faint">
                        {r.serviceSnapshot?.duration ?? "—"} min
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gold">
                      {formatPKR(r.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[r.status]}>{r.status.replace("_", " ")}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-fg-muted">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
