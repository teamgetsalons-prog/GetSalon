"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { login as authLogin } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Scissors } from "lucide-react";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@getsalons/shared/validations/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-line bg-card p-7 shadow-xl sm:p-9">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-gold-950">
          <Scissors className="h-5 w-5" />
        </span>
        <h1 className="font-display mt-5 text-center text-2xl font-bold">
          {title}
        </h1>
        <p className="mt-1.5 text-center text-sm text-fg-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}

function roleHome(role?: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "owner":
    case "staff":
      return "/salon-dashboard";
    default:
      return "/dashboard";
  }
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const { refresh } = useAuth();

  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setError(null);
    const res = await authLogin(values.email, values.password);
    if (!res.success) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    await refresh();
    // An explicit callbackUrl (e.g. from a guarded page) wins; otherwise
    // land each role on its own panel.
    router.push(callbackUrl ?? roleHome(res.data?.role));
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <>
          New to GetSalons?{" "}
          <Link href="/register" className="font-medium text-gold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="password" required>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-fg-faint hover:text-fg"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={form.formState.isSubmitting}
        >
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}

export function RegisterForm({ asOwner = false }: { asOwner?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const { refresh } = useAuth();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: asOwner ? "owner" : "customer" },
  });

  async function onSubmit(values: RegisterInput) {
    setError(null);
    const res = await api("/api/auth/register", {
      method: "POST",
      json: values,
    });
    if (!res.success) {
      setError(res.message ?? "Registration failed.");
      return;
    }
    // Auto-login after successful registration
    const loginRes = await authLogin(values.email, values.password);
    if (!loginRes.success) {
      router.push("/login");
      return;
    }
    await refresh();
    router.push(asOwner ? "/partner/register" : "/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title={asOwner ? "Partner with GetSalons" : "Create your account"}
      subtitle={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name" required>Full name</Label>
          <Input id="name" placeholder="Ayesha Khan" autoComplete="name" {...form.register("name")} />
          <FieldError message={form.formState.errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="phone" required>Mobile number</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03XX XXXXXXX"
            {...form.register("phone")}
          />
          <FieldError message={form.formState.errors.phone?.message} />
        </div>

        <div>
          <Label htmlFor="password" required>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-fg-faint hover:text-fg"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={form.formState.errors.password?.message} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            {...form.register("confirmPassword")}
          />
          <FieldError message={form.formState.errors.confirmPassword?.message} />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={form.formState.isSubmitting}
        >
          {asOwner ? "Create business account" : "Sign up free"}
        </Button>

        <p className="text-center text-xs text-fg-faint">
          {asOwner ? (
            <>
              Booking as a customer instead?{" "}
              <Link href="/register" className="text-gold hover:underline">
                Customer signup
              </Link>
            </>
          ) : (
            <>
              Own a salon?{" "}
              <Link href="/register?as=owner" className="text-gold hover:underline">
                Create a business account
              </Link>
            </>
          )}
        </p>
      </form>
    </AuthShell>
  );
}
