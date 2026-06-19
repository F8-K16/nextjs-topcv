import type { CompanyFilters } from "@/app/stores/company.store";
import type { JobFilters } from "@/app/stores/job.store";

export function jobFiltersToStableQuery(filters: JobFilters): string {
  const entries = Object.entries(filters as Record<string, string | number>)
    .filter(([key, value]) => {
      if (
        value === "" ||
        value === 0 ||
        value === undefined ||
        value === null
      ) {
        return false;
      }
      if (key === "page" && Number(value) <= 1) return false;
      return true;
    })
    .map(([k, v]) => [k, String(v)] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  const p = new URLSearchParams();
  for (const [k, v] of entries) p.set(k, v);
  return p.toString();
}

export function companyFiltersToStableQuery(filters: CompanyFilters): string {
  const entries = Object.entries(filters as Record<string, string | number>)
    .filter(
      ([, value]) =>
        value !== "" &&
        value !== 0 &&
        value !== undefined &&
        value !== null,
    )
    .map(([k, v]) => [k, String(v)] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  const p = new URLSearchParams();
  for (const [k, v] of entries) p.set(k, v);
  return p.toString();
}
