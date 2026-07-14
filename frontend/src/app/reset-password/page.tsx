import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { Spinner } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
