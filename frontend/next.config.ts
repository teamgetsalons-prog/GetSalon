import path from "path";
import type { NextConfig } from "next";

// Where /api/* requests get proxied. Deliberately NOT NEXT_PUBLIC_API_URL:
// that var is baked into client bundles and a wrong value there has broken
// production twice. The default is hardcoded so the proxy works with zero
// Vercel config; API_PROXY_URL exists as an escape hatch if the backend URL
// ever changes.
const API_ORIGIN =
  process.env.API_PROXY_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://getsalon.onrender.com"
    : "http://localhost:3001");

const nextConfig: NextConfig = {
  // Monorepo: trace from the repo root so ../shared and hoisted
  // node_modules are included in the deployment bundle.
  outputFileTracingRoot: path.join(__dirname, ".."),
  transpilePackages: ["@getsalons/shared"],
  // Files under ../shared resolve bare imports (clsx, zod, tailwind-merge)
  // by walking up from THEIR directory, which misses frontend/node_modules.
  // Add explicit fallbacks so resolution works no matter where npm installed
  // (frontend/node_modules on a standalone install, ../node_modules when
  // hoisted by workspaces).
  webpack: (config) => {
    config.resolve.modules = [
      ...(config.resolve.modules ?? ["node_modules"]),
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "../node_modules"),
    ];
    return config;
  },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  // Proxy all /api/* calls to the backend through our own domain. The
  // browser only ever talks to www.getsalons.com, which makes the session
  // cookie first-party (Safari/iOS block cross-site cookies entirely, so a
  // direct browser->Render setup cannot support login there) and takes CORS
  // out of the picture for the client.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      // Authenticated panels must never be served from any cache (browser,
      // proxy, or back/forward) - a cached copy could show a logged-out or
      // logged-in-as-someone-else visitor stale privileged content.
      {
        source: "/(admin|salon-dashboard|dashboard)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/(admin|salon-dashboard|dashboard)",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
