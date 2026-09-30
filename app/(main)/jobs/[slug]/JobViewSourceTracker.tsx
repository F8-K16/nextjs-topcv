"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import axiosClient from "@/lib/axios";

function resolveViewSource(utm: string | null, referrer: string): string {
  if (utm) {
    const v = utm.toLowerCase();
    if (v.includes("mail")) return "email";
    if (
      v.includes("fb") ||
      v.includes("facebook") ||
      v.includes("linkedin") ||
      v.includes("tiktok") ||
      v.includes("twitter") ||
      v.includes("zalo")
    ) {
      return "social";
    }
    if (v.includes("google") || v.includes("bing") || v.includes("coccoc")) {
      return "organic";
    }
    return "other";
  }

  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (
      host.includes("google.") ||
      host.includes("bing.") ||
      host.includes("coccoc.")
    ) {
      return "organic";
    }
    if (
      host.includes("facebook.") ||
      host.includes("linkedin.") ||
      host.includes("twitter.") ||
      host.includes("tiktok.") ||
      host.includes("zalo.")
    ) {
      return "social";
    }
    if (host === window.location.hostname) {
      const path = url.pathname;
      if (path.startsWith("/jobs")) return "jobs";
      if (path.startsWith("/companies")) return "company";
      if (path === "/" || path === "") return "home";
      if (path.startsWith("/search") || path.includes("q=")) return "search";
      return "referral";
    }
    return "referral";
  } catch {
    return "other";
  }
}

export default function JobViewSourceTracker({ jobId }: { jobId: number }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!jobId || jobId < 1) return;
    const key = `jp:job-view-source:${jobId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }

    const source = resolveViewSource(
      searchParams.get("utm_source"),
      typeof document !== "undefined" ? document.referrer : "",
    );

    void axiosClient
      .post(`/jobs/${jobId}/view-source`, { source })
      .catch(() => undefined);
  }, [jobId, searchParams]);

  return null;
}
