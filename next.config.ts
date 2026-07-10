import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json exists in the user home directory; pin the
  // tracing root so Next doesn't treat the home dir as the workspace.
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["mongoose"],
  eslint: {
    ignoreDuringBuilds: true,
  },
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
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
