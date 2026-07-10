import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/salon-dashboard",
          "/admin",
          "/book/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
