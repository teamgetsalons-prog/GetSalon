import type { CorsOptions } from "cors";
import { getEnv } from "../config.js";

// Trim whitespace and a trailing slash so "https://x.com/", "https://x.com ",
// etc. from a copy-pasted env var still match - the raw origin header from a
// browser never has a trailing slash, so a stray one in config would
// otherwise cause an exact-match failure that's maddening to debug.
function normalize(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

// CORS_ORIGIN may be a comma-separated list, so multiple frontends
// (production + a preview deploy, for example) can be allowed at once.
function allowedOrigins(): string[] {
  const { CORS_ORIGIN, APP_URL } = getEnv();
  return [
    ...CORS_ORIGIN.split(",").map(normalize).filter(Boolean),
    normalize(APP_URL),
    "http://localhost:3000",
  ];
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins().includes(normalize(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
