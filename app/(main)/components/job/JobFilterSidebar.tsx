"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterList from "./FilterList";
import { SlidersHorizontal, X } from "lucide-react";
import { useMetadataStore } from "@/app/stores/metadata.store";
import CategoryFilterAccordion from "./CategoryFilterAccordion";

const FILTER_KEYS = [
  "categoryIds",
  "categoryId",
  "provinceId",
  "districtId",
  "salaryRange",
  "experienceLevel",
  "jobType",
  "companyId",
] as const;

export default function JobFilterSidebar() {
  const { data } = useMetadataStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const salaryOptions = useMemo(() => data?.SalaryRangeOptions ?? [], [data]);
  const expOptions = useMemo(() => data?.EXPERIENCE_OPTIONS ?? [], [data]);

  const jobTypeOptions = useMemo(() => data?.JOB_TYPE_OPTIONS ?? [], [data]);

  const provinceOptions = useMemo(
    () =>
      data?.provinces.map((p) => ({
        value: String(p.id),
        label: p.name,
      })) ?? [],
    [data],
  );

  if (!data) return null;

  const currentProvince = searchParams.get("provinceId");
  const currentSalary = searchParams.get("salaryRange");
  const currentExp = searchParams.get("experienceLevel");
  const currentJobType = searchParams.get("jobType");

  const activeFilterCount = FILTER_KEYS.reduce((n, key) => {
    if (key === "categoryId") return n;
    const v = searchParams.get(key);
    return v ? n + 1 : n;
  }, 0);
  const hasCategoryFilter =
    !!searchParams.get("categoryIds") || !!searchParams.get("categoryId");
  const activeFilterCountWithCategory =
    activeFilterCount + (hasCategoryFilter ? 1 : 0);

  const handleFilter = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) params.delete(key);
    else params.set(key, String(value));

    params.delete("page");

    router.push(`/jobs?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/jobs");
  };

  return (
    <aside className="z-20 w-full shrink-0 md:sticky md:top-20 md:w-[260px] md:self-start lg:w-[280px]">
      <div className="flex max-h-[min(70vh,720px)] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(15,23,42,0.06)] md:max-h-[calc(100vh-6rem)]">
        <div className="relative border-b border-zinc-100 bg-gradient-to-br from-zinc-50/95 via-white to-primary/[0.03] px-4 pb-3 pt-4">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-emerald-400/90 to-teal-500/80"
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
                  {activeFilterCountWithCategory > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground shadow-sm">
                      {activeFilterCountWithCategory}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Thu hẹp kết quả theo ngành, khu vực và điều kiện làm việc.
                </p>
              </div>
            </div>

            {activeFilterCountWithCategory > 0 ? (
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
          <Section title="Ngành nghề">
            <CategoryFilterAccordion tree={data.categoryTree} />
          </Section>

          <SectionDivider />

          <Section title="Địa điểm">
            <FilterList
              groupLabel="Lọc theo địa điểm"
              items={provinceOptions}
              current={currentProvince}
              onSelect={(val) => handleFilter("provinceId", val)}
            />
          </Section>

          <SectionDivider />

          <Section title="Mức lương">
            <FilterList
              groupLabel="Lọc theo mức lương"
              items={salaryOptions}
              current={currentSalary}
              onSelect={(val) => handleFilter("salaryRange", val)}
            />
          </Section>

          <SectionDivider />

          <Section title="Kinh nghiệm">
            <FilterList
              groupLabel="Lọc theo kinh nghiệm"
              items={expOptions}
              current={currentExp}
              onSelect={(val) => handleFilter("experienceLevel", val)}
            />
          </Section>

          <SectionDivider />

          <Section title="Hình thức làm việc">
            <FilterList
              groupLabel="Lọc theo hình thức làm việc"
              items={jobTypeOptions}
              current={currentJobType}
              onSelect={(val) => handleFilter("jobType", val)}
            />
          </Section>
        </div>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-3 first:pt-1 last:pb-1">
      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">
        <span className="h-px flex-1 max-w-[12px] rounded-full bg-primary/35" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function SectionDivider() {
  return (
    <div
      className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"
      aria-hidden
    />
  );
}
