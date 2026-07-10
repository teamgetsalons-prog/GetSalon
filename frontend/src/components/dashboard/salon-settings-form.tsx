"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { GenderServed } from "@getsalons/shared/types";

export interface SalonSettingsData {
  name: string;
  description: string;
  about: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  genderServed: GenderServed;
  homeService: boolean;
  instagram: string;
  facebook: string;
  cancellationPolicy: string;
}

export function SalonSettingsForm({
  salonId,
  initial,
}: {
  salonId: string;
  initial: SalonSettingsData;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function set<K extends keyof SalonSettingsData>(
    key: K,
    value: SalonSettingsData[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await api(`/api/salons/${salonId}`, {
      method: "PATCH",
      json: {
        name: form.name,
        description: form.description,
        about: form.about,
        address: form.address,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        website: form.website,
        genderServed: form.genderServed,
        homeService: form.homeService,
        socials: { instagram: form.instagram, facebook: form.facebook },
        policies: { cancellation: form.cancellationPolicy },
      },
    });
    setSaving(false);
    setMessage(
      res.success
        ? "Salon profile updated."
        : res.message ??
            Object.values(res.errors ?? {}).flat().join(" ") ??
            "Could not save."
    );
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold">Salon settings</h2>

      <div className="space-y-4 rounded-2xl border border-line bg-card p-6">
        <div>
          <Label required>Salon name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label required>Short description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            maxLength={500}
          />
        </div>
        <div>
          <Label>About</Label>
          <Textarea
            value={form.about}
            onChange={(e) => set("about", e.target.value)}
            rows={4}
            maxLength={3000}
          />
        </div>
        <div>
          <Label required>Address</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website} placeholder="https://…" onChange={(e) => set("website", e.target.value)} />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input value={form.instagram} placeholder="https://instagram.com/…" onChange={(e) => set("instagram", e.target.value)} />
          </div>
          <div>
            <Label>Facebook</Label>
            <Input value={form.facebook} placeholder="https://facebook.com/…" onChange={(e) => set("facebook", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Who do you serve?</Label>
            <Select
              value={form.genderServed}
              onChange={(e) => set("genderServed", e.target.value as GenderServed)}
            >
              <option value="unisex">Unisex</option>
              <option value="women">Women only</option>
              <option value="men">Men only</option>
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.homeService}
                onChange={(e) => set("homeService", e.target.checked)}
                className="h-4 w-4 accent-[#d4941f]"
              />
              We offer home service
            </label>
          </div>
        </div>

        <div>
          <Label>Cancellation policy</Label>
          <Textarea
            value={form.cancellationPolicy}
            onChange={(e) => set("cancellationPolicy", e.target.value)}
            rows={2}
            placeholder="e.g. Please cancel at least 2 hours before your appointment."
            maxLength={1000}
          />
        </div>
      </div>

      {message && <p className="text-sm text-gold">{message}</p>}

      <Button type="submit" loading={saving}>
        Save settings
      </Button>
    </form>
  );
}
