import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/auth-forms";
import { Spinner } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  return (
    <Suspense fallback={<Spinner />}>
      <RegisterForm asOwner={as === "owner"} />
    </Suspense>
  );
}
