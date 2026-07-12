"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            config: {
              type: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
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

export function GoogleSignInButton({
  mode = "signin",
}: {
  mode?: "signin" | "signup";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const buttonRef = useRef<HTMLDivElement>(null);
  const { refresh } = useAuth();

  const handleGoogleCredential = useCallback(
    async (response: { credential: string }) => {
      const res = await api<{
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
      }>("/api/auth/google", {
        method: "POST",
        json: { credential: response.credential },
      });

      if (res.success && res.data) {
        await refresh();
        router.push(callbackUrl ?? roleHome(res.data.role));
        router.refresh();
      } else {
        window.alert(res.message ?? "Google sign-in failed. Please try again.");
      }
    },
    [refresh, router, callbackUrl]
  );

  useEffect(() => {
    // Load Google Identity Services script
    if (document.getElementById("google-gis-script")) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-gis-script";
    script.async = true;
    script.defer = true;
    script.onload = () => renderButton();
    document.head.appendChild(script);

    function renderButton() {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      // Read client ID from meta tag
      const clientId =
        document
          .querySelector('meta[name="google-client-id"]')
          ?.getAttribute("content") || "";

      if (!clientId) {
        // Google sign-in not configured — show a helpful message
        if (buttonRef.current) {
          buttonRef.current.innerHTML = `
            <div class="rounded-xl border border-line bg-bg-soft px-4 py-3 text-center text-xs text-fg-faint">
              Google sign-in is not configured yet.
            </div>
          `;
        }
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: mode === "signin" ? "signin_with" : "signup_with",
        width: buttonRef.current.offsetWidth || 400,
      });
    }
  }, [handleGoogleCredential, mode]);

  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-fg-faint">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}
