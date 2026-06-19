import "server-only";

import type { CompanyResponse } from "@/app/types/company.type";
import { nextFetchCache } from "@/lib/next-fetch-cache";
import { API_BASE_URL } from "@/lib/api-base-url";

async function fetchTopHiringCompanies(
  query: string,
): Promise<CompanyResponse> {
  const base = API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const res = await fetch(`${base}/companies/top-hiring?${query}`, {
    ...nextFetchCache.topHiring,
  });
  if (!res.ok) throw new Error(`companies/top-hiring ${res.status}`);
  return res.json();
}

export async function getCachedHomeTopCompanies(): Promise<CompanyResponse> {
  try {
    return await fetchTopHiringCompanies(
      new URLSearchParams({ limit: "8" }).toString(),
    );
  } catch {
    return {
      companies: [],
      pagination: { total: 0, page: 1, limit: 8, totalPages: 0 },
      provinces: [],
      categories: [],
      query: {},
    };
  }
}
