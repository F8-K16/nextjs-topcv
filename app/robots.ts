import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/job-posting";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/auth",
        "/employer",
        "/profile",
        "/messages",
        "/cv/editor",
        "/cv/my",
        "/applied-jobs",
        "/saved-jobs",
        "/followed-companies",
        "/api",
      ],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
