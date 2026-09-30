import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api-base-url";
import { companyPublicPath } from "@/lib/company-path";
import { jobPublicPath } from "@/lib/job-path";
import { getSiteUrl } from "@/lib/job-posting";
import { nextFetchCache } from "@/lib/next-fetch-cache";

type PageResult<T> = {
  items: T[];
  totalPages: number;
};

async function fetchPages<T>(
  path: string,
  pick: (body: unknown) => PageResult<T>,
  cache: RequestInit = { next: { revalidate: 3600 } },
) {
  if (!API_BASE_URL) return [] as T[];
  const all: T[] = [];
  for (let page = 1; page <= 20; page += 1) {
    try {
      const res = await fetch(
        `${API_BASE_URL}${path}?page=${page}&limit=100`,
        cache,
      );
      if (!res.ok) break;
      const parsed = pick(await res.json());
      all.push(...parsed.items);
      if (page >= parsed.totalPages || parsed.items.length === 0) break;
    } catch {
      break;
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/jobs",
    "/companies",
    "/about",
    "/contact",
    "/blog",
    "/salary-insights",
  ].map((path) => ({
    url: `${site}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));

  const jobs = await fetchPages<{
    id: number;
    slug?: string | null;
    updatedAt?: string;
  }>("/jobs", (body) => {
    const data = body as {
      jobs?: { id: number; slug?: string | null; updatedAt?: string }[];
      pagination?: { totalPages?: number };
    };
    return {
      items: data.jobs ?? [],
      totalPages: data.pagination?.totalPages ?? 1,
    };
  });

  const companies = await fetchPages<{
    id: number;
    slug?: string | null;
    updatedAt?: string;
  }>("/companies", (body) => {
    const data = body as {
      companies?: { id: number; slug?: string | null; updatedAt?: string }[];
      pagination?: { totalPages?: number } | null;
    };
    return {
      items: data.companies ?? [],
      totalPages: data.pagination?.totalPages ?? 1,
    };
  });

  const posts = await fetchPages<{
    slug: string;
    updatedAt?: string;
  }>(
    "/blog-posts",
    (body) => {
      const data = body as {
        posts?: { slug: string; updatedAt?: string }[];
        pagination?: { totalPages?: number };
      };
      return {
        items: data.posts ?? [],
        totalPages: data.pagination?.totalPages ?? 1,
      };
    },
    nextFetchCache.blog as RequestInit,
  );

  return [
    ...staticRoutes,
    ...jobs.map((job) => ({
      url: `${site}${jobPublicPath(job)}`,
      lastModified: job.updatedAt ? new Date(job.updatedAt) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...companies.map((company) => ({
      url: `${site}${companyPublicPath(company)}`,
      lastModified: company.updatedAt ? new Date(company.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${site}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
