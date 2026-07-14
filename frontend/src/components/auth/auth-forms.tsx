"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { login as authLogin } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Scissors } from "lucide-react";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@getsalons/shared/validations/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { GoogleSignInButton } from "./google-signin-button";

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-gold hover:underline">
              Forgot password?
            </Link>
          </div>
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

      <GoogleSignInButton mode="signin" />
    </AuthShell>
  );
}

export function RegisterForm({ asOwner = false }: { asOwner?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const { refresh } = useAuth();
  // Explicit account-type choice; ?as=owner preselects but the user can
  // switch freely without leaving the page.
  const [isOwner, setIsOwner] = useState(asOwner);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: asOwner ? "owner" : "customer" },
  });

  function chooseRole(owner: boolean) {
    setIsOwner(owner);
    form.setValue("role", owner ? "owner" : "customer");
  }

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
    router.push(isOwner ? "/partner/register" : "/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title={isOwner ? "Partner with GetSalons" : "Create your account"}
      subtitle={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {/* Account type */}
      <div className="mb-5 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
        <button
          type="button"
          role="radio"
          aria-checked={!isOwner}
          onClick={() => chooseRole(false)}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition-all ${
            !isOwner
              ? "border-gold-500 bg-gold-500/10 ring-1 ring-gold-500/40"
              : "border-line hover:border-gold-500/40"
          }`}
        >
          <p className="text-sm font-semibold">Customer</p>
          <p className="mt-0.5 text-xs text-fg-muted">Book salon appointments</p>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isOwner}
          onClick={() => chooseRole(true)}
          className={`cursor-pointer rounded-2xl border p-3.5 text-left transition-all ${
            isOwner
              ? "border-gold-500 bg-gold-500/10 ring-1 ring-gold-500/40"
              : "border-line hover:border-gold-500/40"
          }`}
        >
          <p className="text-sm font-semibold">Salon Owner</p>
          <p className="mt-0.5 text-xs text-fg-muted">List &amp; manage my salon</p>
        </button>
      </div>

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
          {isOwner ? "Create business account" : "Sign up free"}
        </Button>
      </form>

      <GoogleSignInButton mode="signup" />

      <p className="text-center text-xs text-fg-faint">
        {isOwner
          ? "After signing up you'll add your salon details for review."
          : "Free forever for customers — book unlimited appointments."}
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    // The backend always returns the same generic response regardless of
    // whether the account exists, so this UI has nothing else to branch on.
    await api("/api/auth/forgot-password", { method: "POST", json: values });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell title="Check your email" subtitle="">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="text-sm text-fg-muted">
            If an account with that email exists, we&apos;ve sent a password reset link. It expires in 30 minutes.
          </p>
          <Link href="/login" className="text-sm font-medium text-gold hover:underline">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={form.formState.isSubmitting}
        >
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        <Link href="/login" className="font-medium text-gold hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setError(null);
    const res = await api("/api/auth/reset-password", { method: "POST", json: values });
    if (!res.success) {
      setError(res.message ?? "This reset link is invalid or has expired. Please request a new one.");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <AuthShell title="Invalid reset link" subtitle="">
        <p className="text-center text-sm text-fg-muted">
          This password reset link is missing its token. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 block text-center text-sm font-medium text-gold hover:underline"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password reset" subtitle="">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="text-sm text-fg-muted">Your password has been reset.</p>
          <Button onClick={() => router.push("/login")} className="mt-1">
            Log in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make it something you'll remember.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...form.register("token")} />

        <div>
          <Label htmlFor="password" required>New password</Label>
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
          <Label htmlFor="confirmPassword" required>Confirm new password</Label>
          <Input
            id="confirmPassword"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
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
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
