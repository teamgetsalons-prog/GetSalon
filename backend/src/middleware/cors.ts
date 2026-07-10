import type { CorsOptions } from "cors";
import { getEnv } from "../config.js";

// Trim whitespace and a trailing slash so "https://x.com/", "https://x.com ",
// etc. from a copy-pasted env var still match - the raw origin header from a
// browser never has a trailing slash, so a stray one in config would
// otherwise cause an exact-match failure that's maddening to debug.
function normalize(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

// The production site is always allowed regardless of env config - the
// frontend proxies /api/* here and forwards the browser's Origin header,
// so a mis-set CORS_ORIGIN env var must never be able to take the live
// site down. CORS_ORIGIN (comma-separated) extends this list for extra
// origins like preview deployments.
const PRODUCTION_ORIGINS = [
  "https://www.getsalons.com",
  "https://getsalons.com",
];

function allowedOrigins(): string[] {
  const { CORS_ORIGIN, APP_URL } = getEnv();
  return [
    ...PRODUCTION_ORIGINS,
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
