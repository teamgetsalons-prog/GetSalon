"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  createSalonSchema,
  type CreateSalonInput,
} from "@getsalons/shared/validations/salon";
import { api } from "@/lib/api";
import { cn } from "@getsalons/shared/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";

interface Option {
  _id: string;
  name: string;
}

interface CityOption extends Option {
  areas: Option[];
}

export function SalonRegisterForm({
  cities,
  categories,
}: {
  cities: CityOption[];
  categories: Option[];
}) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<CreateSalonInput>({
    resolver: zodResolver(createSalonSchema),
    defaultValues: { genderServed: "unisex", homeService: false, categoryIds: [] },
  });

  const cityId = form.watch("cityId");
  const selectedCity = cities.find((c) => c._id === cityId);
  const selectedCategories = form.watch("categoryIds") ?? [];

  function toggleCategory(id: string) {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    form.setValue("categoryIds", next, { shouldValidate: true });
  }

  async function onSubmit(values: CreateSalonInput) {
    setError(null);
    const res = await api<{ id: string; slug: string }>("/api/salons", {
      method: "POST",
      json: values,
    });
    if (!res.success) {
      setError(res.message ?? "Could not submit your salon.");
      return;
    }
    // Refresh JWT so the owner dashboard resolves the new salon
    await refresh();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-line bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="font-display mt-4 text-2xl font-bold">
          Salon submitted for review!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          Our team reviews every new listing to keep quality high. You&apos;ll
          get a notification once you&apos;re approved — usually within 24–48
          hours. Meanwhile, set up your services and team.
        </p>
        <Button className="mt-6" onClick={() => router.push("/salon-dashboard")}>
          Go to salon dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="name" required>Salon name</Label>
        <Input id="name" placeholder="e.g. Royal Beauty Salon" {...form.register("name")} />
        <FieldError message={form.formState.errors.name?.message} />
      </div>

      <div>
        <Label required>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => toggleCategory(cat._id)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                selectedCategories.includes(cat._id)
                  ? "border-gold-500 bg-gold-500/15 text-gold"
                  : "border-line text-fg-muted hover:border-gold-500/40"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <FieldError message={form.formState.errors.categoryIds?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cityId" required>City</Label>
          <Select id="cityId" {...form.register("cityId")}>
            <option value="">Select city…</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
          <FieldError message={form.formState.errors.cityId?.message} />
        </div>
        <div>
          <Label htmlFor="areaId">Area</Label>
          <Select id="areaId" {...form.register("areaId")} disabled={!selectedCity}>
            <option value="">Select area…</option>
            {selectedCity?.areas.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address" required>Street address</Label>
        <Input id="address" placeholder="Shop #, street, landmark…" {...form.register("address")} />
        <FieldError message={form.formState.errors.address?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone" required>Business phone</Label>
          <Input id="phone" type="tel" placeholder="03XX XXXXXXX" {...form.register("phone")} />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input id="whatsapp" type="tel" placeholder="03XX XXXXXXX" {...form.register("whatsapp")} />
          <FieldError message={form.formState.errors.whatsapp?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="genderServed" required>Who do you serve?</Label>
          <Select id="genderServed" {...form.register("genderServed")}>
            <option value="unisex">Unisex — everyone welcome</option>
            <option value="women">Women only</option>
            <option value="men">Men only</option>
          </Select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              {...form.register("homeService")}
              className="h-4 w-4 accent-[#d4941f]"
            />
            We offer home service
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="description" required>Short description</Label>
        <Textarea
          id="description"
          placeholder="What makes your salon special? (shown in search results)"
          maxLength={500}
          {...form.register("description")}
        />
        <FieldError message={form.formState.errors.description?.message} />
      </div>

      <div>
        <Label htmlFor="about">About (detailed)</Label>
        <Textarea
          id="about"
          rows={5}
          placeholder="Your story, specialities, awards, hygiene standards…"
          maxLength={3000}
          {...form.register("about")}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={form.formState.isSubmitting}
      >
        Submit salon for review
      </Button>
    </form>
  );
}
