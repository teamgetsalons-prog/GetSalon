"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await api("/api/support/contact", {
      method: "POST",
      json: form,
    });
    setSaving(false);
    if (res.success) {
      setSent(true);
    } else {
      setError(res.message ?? "Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-8 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-gold" />
        <h3 className="mt-3 font-display text-lg font-bold text-fg">Message sent!</h3>
        <p className="mt-2 text-sm text-fg-muted">
          Thank you for reaching out. We&apos;ll get back to you within 1-2 business days.
        </p>
        <button
          onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
          className="mt-4 text-sm font-medium text-gold hover:underline cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label required>Your name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div>
          <Label required>Email address</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
            maxLength={200}
          />
        </div>
      </div>
      <div>
        <Label required>Subject</Label>
        <Input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="How can we help?"
          required
          minLength={3}
          maxLength={150}
        />
      </div>
      <div>
        <Label required>Message</Label>
        <Textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us more about your question or feedback..."
          rows={5}
          required
          minLength={10}
          maxLength={3000}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={saving} disabled={saving}>
        <Send className="h-4 w-4" /> Send message
      </Button>
    </form>
  );
}
