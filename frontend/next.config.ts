import path from "path";
import type { NextConfig } from "next";

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
