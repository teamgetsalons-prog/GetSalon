"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Spinner } from "@/components/ui/misc";

interface CityRow {
  _id: string;
  name: string;
  province: string;
  salonCount: number;
  areas?: { _id: string; name: string }[];
}

interface CategoryRow {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminCatalogPage() {
  const [cities, setCities] = useState<CityRow[] | null>(null);
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);

  const [cityDraft, setCityDraft] = useState({ name: "", province: "", areas: "" });
  const [catDraft, setCatDraft] = useState({ name: "", icon: "sparkles" });
  const [savingCity, setSavingCity] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [cityRes, catRes] = await Promise.all([
      api<CityRow[]>("/api/cities?withAreas=1"),
      api<CategoryRow[]>("/api/categories"),
    ]);
    setCities(cityRes.success && cityRes.data ? cityRes.data : []);
    setCategories(catRes.success && catRes.data ? catRes.data : []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addCity(e: React.FormEvent) {
    e.preventDefault();
    setSavingCity(true);
    setMessage(null);
    const res = await api("/api/cities", {
      method: "POST",
      json: {
        name: cityDraft.name,
        province: cityDraft.province,
        areas: cityDraft.areas
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      },
    });
    setSavingCity(false);
    setMessage(res.message ?? null);
    if (res.success) {
      setCityDraft({ name: "", province: "", areas: "" });
      void load();
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setSavingCat(true);
    setMessage(null);
    const res = await api("/api/categories", {
      method: "POST",
      json: catDraft,
    });
    setSavingCat(false);
    setMessage(res.message ?? null);
    if (res.success) {
      setCatDraft({ name: "", icon: "sparkles" });
      void load();
    }
  }

  if (!cities || !categories) return <Spinner />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {message && (
        <p className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2.5 text-sm text-gold lg:col-span-2">
          {message}
        </p>
      )}

      {/* Cities */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Cities ({cities.length})</h2>
        <form
          onSubmit={addCity}
          className="mb-4 space-y-3 rounded-2xl border border-line bg-card p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label required>City name</Label>
              <Input
                value={cityDraft.name}
                onChange={(e) => setCityDraft({ ...cityDraft, name: e.target.value })}
                placeholder="e.g. Peshawar"
              />
            </div>
            <div>
              <Label required>Province</Label>
              <Input
                value={cityDraft.province}
                onChange={(e) => setCityDraft({ ...cityDraft, province: e.target.value })}
                placeholder="e.g. KPK"
              />
            </div>
          </div>
          <div>
            <Label>Areas (comma separated)</Label>
            <Input
              value={cityDraft.areas}
              onChange={(e) => setCityDraft({ ...cityDraft, areas: e.target.value })}
              placeholder="Hayatabad, University Town, Saddar"
            />
          </div>
          <Button
            size="sm"
            type="submit"
            loading={savingCity}
            disabled={!cityDraft.name || !cityDraft.province}
          >
            <Plus className="h-3.5 w-3.5" /> Add city
          </Button>
        </form>

        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {cities.map((city) => (
            <div key={city._id} className="p-4">
              <p className="text-sm font-semibold">
                {city.name}{" "}
                <span className="text-xs font-normal text-fg-faint">
                  · {city.province} · {city.salonCount} salons
                </span>
              </p>
              {city.areas && city.areas.length > 0 && (
                <p className="mt-1 text-xs text-fg-muted">
                  {city.areas.map((a) => a.name).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Categories ({categories.length})
        </h2>
        <form
          onSubmit={addCategory}
          className="mb-4 space-y-3 rounded-2xl border border-line bg-card p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label required>Category name</Label>
              <Input
                value={catDraft.name}
                onChange={(e) => setCatDraft({ ...catDraft, name: e.target.value })}
                placeholder="e.g. Nail Art"
              />
            </div>
            <div>
              <Label>Icon (lucide name)</Label>
              <Input
                value={catDraft.icon}
                onChange={(e) => setCatDraft({ ...catDraft, icon: e.target.value })}
                placeholder="sparkles, scissors, brush…"
              />
            </div>
          </div>
          <Button size="sm" type="submit" loading={savingCat} disabled={!catDraft.name}>
            <Plus className="h-3.5 w-3.5" /> Add category
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-5">
          {categories.map((cat) => (
            <span
              key={cat._id}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg-muted"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
