"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/** Shows a one-time confirmation after logout (flag survives the full
 *  page navigation via sessionStorage). */
export function LogoutToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("gs-logged-out") === "1") {
        sessionStorage.removeItem("gs-logged-out");
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 3500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="animate-fade-in-up fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-line bg-card px-5 py-3 text-sm font-medium shadow-2xl"
    >
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      You&apos;ve been logged out. See you soon!
    </div>
  );
}
