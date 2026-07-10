"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Spinner } from "@/components/ui/misc";

interface Profile {
  name: string;
  email: string;
  phone?: string;
  city?: string;
}

export default function SettingsPage() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await api<Profile>("/api/users/me");
      if (res.success && res.data) setProfile(res.data);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    const res = await api("/api/users/me", {
      method: "PATCH",
      json: {
        name: profile.name,
        phone: profile.phone ?? "",
        city: profile.city ?? "",
      },
    });
    setSaving(false);
    setMessage(res.message ?? (res.success ? "Saved." : "Could not save."));
    if (res.success) await refresh();
  }

  if (!profile) return <Spinner />;

  return (
    <div className="max-w-lg">
      <h2 className="mb-4 text-lg font-semibold">Profile settings</h2>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-line bg-card p-6">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled />
          <p className="mt-1 text-xs text-fg-faint">Email cannot be changed.</p>
        </div>
        <div>
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            value={profile.phone ?? ""}
            placeholder="03XX XXXXXXX"
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={profile.city ?? ""}
            placeholder="e.g. Lahore"
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          />
        </div>

        {message && <p className="text-sm text-gold">{message}</p>}

        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
