"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "next-themes";
import { LogoutToast } from "./logout-toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <LogoutToast />
      </ThemeProvider>
    </AuthProvider>
  );
}
