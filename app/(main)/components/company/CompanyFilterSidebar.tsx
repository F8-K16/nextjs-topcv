"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { useLocationStore } from "@/app/stores/location.store";
import { useMetadataStore } from "@/app/stores/metadata.store";
import FilterList from "../job/FilterList";

const FILTER_KEYS = ["categoryId", "provinceId", "districtId"] as const;

export default function CompanyFilterSidebar() {
  const { data, loading, fetchMeta } = useMetadataStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchDistricts, districtsMap } = useLocationStore();

  useEffect(() => {
    if (!data && !loading) void fetchMeta();
  }, [data, loading, fetchMeta]);

  const categoryOptions = useMemo(
    () =>
      data?.categoryParents?.map((c) => ({
        value: String(c.id),
        label: c.name,
      })) ?? [],
    [data?.categoryParents],
  );

  const provinceOptions = useMemo(
    () =>
      data?.provinces.map((p) => ({
        value: String(p.id),
        label: p.name,
      })) ?? [],
    [data],
  );

  const currentProvince = searchParams.get("provinceId");
  const districtOptions = useMemo(() => {
    if (!currentProvince) return [];
    const list = districtsMap[Number(currentProvince)] ?? [];
    return list.map((d) => ({ value: String(d.id), label: d.name }));
  }, [currentProvince, districtsMap]);

  useEffect(() => {
    if (currentProvince) void fetchDistricts(Number(currentProvince));
  }, [currentProvince, fetchDistricts]);

  if (loading && !data) {
    return (
      <aside className="h-48 w-full shrink-0 animate-pulse rounded-2xl bg-zinc-100/80 lg:w-70" />
    );
  }

  if (!data) return null;

  const currentCategory = searchParams.get("categoryId");
  const currentProvinceVal = searchParams.get("provinceId");
  const currentDistrict = searchParams.get("districtId");

  const activeFilterCount = FILTER_KEYS.reduce((n, key) => {
    const v = searchParams.get(key);
    return v ? n + 1 : n;
  }, 0);

  const handleFilter = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "provinceId") {
      if (!value) {
        params.delete("provinceId");
        params.delete("districtId");
      } else {
        params.set("provinceId", String(value));
        params.delete("districtId");
      }
    } else {
      if (!value) params.delete(key);
      else params.set(key, String(value));
    }

    params.delete("page");
    router.push(`/companies?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/companies");
  };

  return (
    <aside className="w-full shrink-0 lg:w-70">
      <div className="sticky top-4 z-10 flex max-h-[min(70vh,720px)] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(15,23,42,0.06)] lg:max-h-[calc(100vh-5rem)]">
        <div className="relative border-b border-zinc-100 bg-linear-to-br from-zinc-50/95 via-white to-primary/3 px-4 pb-3 pt-4">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-emerald-400/90 to-teal-500/80"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15">
                <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-zinc-900">
                    Bộ lọc
                  </h2>
                  {activeFilterCount > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground shadow-sm">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Ngành nghề và khu vực.
                </p>
              </div>
            </div>

            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="group flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5 transition group-hover:scale-110" />
                Xóa
              </button>
            ) : null}
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-0 overflow-y-auto px-3 py-3">
          <section className="py-3 first:pt-1 last:pb-1">
            <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">
              <span className="h-px flex-1 max-w-3 rounded-full bg-primary/35" />
              Ngành nghề
            </h3>
            <FilterList
              groupLabel="Lọc theo ngành nghề"
              items={categoryOptions}
              current={currentCategory}
              onSelect={(val) => handleFilter("categoryId", val)}
            />
          </section>

          <div
            className="h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent"
            aria-hidden
          />

          <section className="py-3 first:pt-1 last:pb-1">
            <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">
              <span className="h-px flex-1 max-w-3 rounded-full bg-primary/35" />
              Tỉnh / Thành phố
            </h3>
            <FilterList
              groupLabel="Lọc theo tỉnh thành"
              items={provinceOptions}
              current={currentProvinceVal}
              onSelect={(val) => handleFilter("provinceId", val)}
            />
          </section>

          {currentProvinceVal ? (
            <>
              <div
                className="h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent"
                aria-hidden
              />
              <section className="py-3 first:pt-1 last:pb-1">
                <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">
                  <span className="h-px flex-1 max-w-3 rounded-full bg-primary/35" />
                  Quận / Huyện
                </h3>
                {districtOptions.length > 0 ? (
                  <FilterList
                    groupLabel="Lọc theo quận huyện"
                    items={districtOptions}
                    current={currentDistrict}
                    onSelect={(val) => handleFilter("districtId", val)}
                  />
                ) : (
                  <p className="text-xs text-zinc-400">Đang tải…</p>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
