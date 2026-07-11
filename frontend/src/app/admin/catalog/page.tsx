"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
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
  icon?: string;
}

export default function AdminCatalogPage() {
  const [cities, setCities] = useState<CityRow[] | null>(null);
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);

  const [cityDraft, setCityDraft] = useState({ name: "", province: "", areas: "" });
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [catDraft, setCatDraft] = useState({ name: "", icon: "sparkles" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [savingCity, setSavingCity] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [cityRes, catRes] = await Promise.all([
      api<CityRow[]>("/api/categories/cities?withAreas=1"),
      api<CategoryRow[]>("/api/categories"),
    ]);
    setCities(cityRes.success && cityRes.data ? cityRes.data : []);
    setCategories(catRes.success && catRes.data ? catRes.data : []);
  }

  useEffect(() => {
    void load();
  }, []);

  function startEditCity(city: CityRow) {
    setEditingCityId(city._id);
    setCityDraft({
      name: city.name,
      province: city.province,
      areas: (city.areas ?? []).map((a) => a.name).join(", "),
    });
    setMessage(null);
  }

  function cancelCityEdit() {
    setEditingCityId(null);
    setCityDraft({ name: "", province: "", areas: "" });
  }

  async function saveCity(e: React.FormEvent) {
    e.preventDefault();
    setSavingCity(true);
    setMessage(null);
    const body = {
      name: cityDraft.name,
      province: cityDraft.province,
      areas: cityDraft.areas.split(",").map((a) => a.trim()).filter(Boolean),
    };
    const res = editingCityId
      ? await api(`/api/categories/cities/${editingCityId}`, { method: "PATCH", json: body })
      : await api("/api/categories/cities", { method: "POST", json: body });
    setSavingCity(false);
    setMessage(res.success ? (editingCityId ? "City updated." : "City added.") : res.message ?? null);
    if (res.success) {
      cancelCityEdit();
      void load();
    }
  }

  async function deleteCity(city: CityRow) {
    if (!window.confirm(`Delete ${city.name} and all its areas? Salons registered there will block this.`)) return;
    const res = await api(`/api/categories/cities/${city._id}`, { method: "DELETE" });
    setMessage(res.success ? `${city.name} deleted.` : res.message ?? "Could not delete.");
    if (res.success) void load();
  }

  function startEditCategory(cat: CategoryRow) {
    setEditingCatId(cat._id);
    setCatDraft({ name: cat.name, icon: cat.icon ?? "sparkles" });
    setMessage(null);
  }

  function cancelCatEdit() {
    setEditingCatId(null);
    setCatDraft({ name: "", icon: "sparkles" });
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSavingCat(true);
    setMessage(null);
    const res = editingCatId
      ? await api(`/api/categories/${editingCatId}`, { method: "PATCH", json: catDraft })
      : await api("/api/categories", { method: "POST", json: catDraft });
    setSavingCat(false);
    setMessage(res.success ? (editingCatId ? "Category updated." : "Category added.") : res.message ?? null);
    if (res.success) {
      cancelCatEdit();
      void load();
    }
  }

  async function deleteCategory(cat: CategoryRow) {
    if (!window.confirm(`Delete category "${cat.name}"? Salons tagged with it will simply lose the tag.`)) return;
    const res = await api(`/api/categories/${cat._id}`, { method: "DELETE" });
    setMessage(res.success ? `${cat.name} deleted.` : res.message ?? "Could not delete.");
    if (res.success) void load();
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
          onSubmit={saveCity}
          className="mb-4 space-y-3 rounded-2xl border border-line bg-card p-5"
        >
          {editingCityId && (
            <p className="flex items-center justify-between rounded-lg bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-gold">
              Editing city
              <button type="button" onClick={cancelCityEdit} aria-label="Cancel edit" className="cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </p>
          )}
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
            {editingCityId ? "Save changes" : (<><Plus className="h-3.5 w-3.5" /> Add city</>)}
          </Button>
        </form>

        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {cities.map((city) => (
            <div key={city._id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
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
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => startEditCity(city)}
                  aria-label={`Edit ${city.name}`}
                  className="cursor-pointer rounded-lg p-2 text-fg-muted transition-colors hover:bg-bg-soft hover:text-gold"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCity(city)}
                  aria-label={`Delete ${city.name}`}
                  className="cursor-pointer rounded-lg p-2 text-fg-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
          onSubmit={saveCategory}
          className="mb-4 space-y-3 rounded-2xl border border-line bg-card p-5"
        >
          {editingCatId && (
            <p className="flex items-center justify-between rounded-lg bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-gold">
              Editing category
              <button type="button" onClick={cancelCatEdit} aria-label="Cancel edit" className="cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </p>
          )}
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
            {editingCatId ? "Save changes" : (<><Plus className="h-3.5 w-3.5" /> Add category</>)}
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-5">
          {categories.length === 0 && (
            <p className="text-xs text-fg-faint">No categories yet.</p>
          )}
          {categories.map((cat) => (
            <span
              key={cat._id}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-fg-muted"
            >
              {cat.name}
              <button
                onClick={() => startEditCategory(cat)}
                aria-label={`Edit ${cat.name}`}
                className="cursor-pointer text-fg-faint transition-colors hover:text-gold"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => deleteCategory(cat)}
                aria-label={`Delete ${cat.name}`}
                className="cursor-pointer text-fg-faint transition-colors hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
