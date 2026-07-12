"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState, Spinner } from "@/components/ui/misc";

interface SupportRow {
  _id: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function OwnerSupportPage() {
  const [rows, setRows] = useState<SupportRow[] | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load() {
    const res = await api<SupportRow[]>("/api/support/mine");
    setRows(res.success && res.data ? res.data : []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (subject.trim().length < 3) {
      setFeedback("Please enter a subject (at least 3 characters).");
      return;
    }
    if (message.trim().length < 10) {
      setFeedback("Please describe your issue in at least 10 characters.");
      return;
    }
    setSending(true);
    setFeedback(null);
    const res = await api("/api/support", {
      method: "POST",
      json: { subject: subject.trim(), message: message.trim() },
    });
    setSending(false);
    if (res.success) {
      setSubject("");
      setMessage("");
      setFeedback("Message sent! The GetSalons team will get back to you here.");
      void load();
    } else {
      const fieldErrors = Object.values(res.errors ?? {}).flat().join(" ");
      setFeedback(fieldErrors || res.message || "Could not send. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold">Contact GetSalons</h2>
      <p className="mb-4 text-sm text-fg-muted">
        Questions, problems or suggestions — send us a message and we&apos;ll
        reply right here.
      </p>

      <form onSubmit={send} className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <div>
          <Label required>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Problem with my gallery photos"
            maxLength={150}
          />
        </div>
        <div>
          <Label required>Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Tell us what's going on…"
            maxLength={3000}
          />
        </div>
        {feedback && <p className="text-sm text-gold">{feedback}</p>}
        <Button type="submit" loading={sending}>
          <Send className="h-4 w-4" /> Send to admin
        </Button>
      </form>

      <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-fg-faint">
        Your messages
      </h3>
      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No messages yet" hint="Anything you send appears here with our reply." />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{row.subject}</p>
                <Badge variant={row.status === "resolved" ? "success" : "gold"}>
                  {row.status === "resolved" ? "Resolved" : "Open"}
                </Badge>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-fg-muted">{row.message}</p>
              <p className="mt-1 text-xs text-fg-faint">
                Sent {new Date(row.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {row.reply && (
                <div className="mt-3 rounded-xl border border-gold-500/30 bg-gold-500/8 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                    GetSalons team
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-fg">{row.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
