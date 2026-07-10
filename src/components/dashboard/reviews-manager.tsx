"use client";

import { useState } from "react";
import { MessageSquareReply } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, EmptyState } from "@/components/ui/misc";

export interface SalonReviewRow {
  _id: string;
  rating: number;
  comment: string;
  customerName: string;
  customerAvatar?: string;
  staffName?: string;
  reply?: string;
  createdAt: string;
}

export function ReviewsManager({ initial }: { initial: SalonReviewRow[] }) {
  const [rows, setRows] = useState(initial);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  async function sendReply(id: string) {
    setSaving(true);
    const res = await api(`/api/reviews/${id}`, {
      method: "PATCH",
      json: { action: "reply", reply: replyText },
    });
    setSaving(false);
    if (res.success) {
      setRows((rs) =>
        rs.map((r) => (r._id === id ? { ...r, reply: replyText } : r))
      );
      setReplyFor(null);
      setReplyText("");
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Customer reviews</h2>
      {rows.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          hint="Reviews appear after customers complete verified bookings."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={row.customerAvatar} name={row.customerName} size={38} />
                  <div>
                    <p className="text-sm font-semibold">{row.customerName}</p>
                    <p className="text-xs text-fg-faint">
                      {new Date(row.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {row.staffName ? ` · served by ${row.staffName}` : ""}
                    </p>
                  </div>
                </div>
                <StarRating value={row.rating} />
              </div>

              <p className="mt-3 text-sm text-fg-muted">{row.comment}</p>

              {row.reply ? (
                <p className="mt-3 rounded-xl bg-bg-soft p-3.5 text-sm text-fg-muted">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <MessageSquareReply className="h-3.5 w-3.5" /> Your reply
                  </span>
                  <span className="mt-1 block">{row.reply}</span>
                </p>
              ) : replyFor === row._id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank your customer or address their concern…"
                    rows={2}
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      loading={saving}
                      disabled={replyText.trim().length < 2}
                      onClick={() => sendReply(row._id)}
                    >
                      Post reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplyFor(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setReplyFor(row._id);
                    setReplyText("");
                  }}
                >
                  <MessageSquareReply className="h-3.5 w-3.5" /> Reply
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
