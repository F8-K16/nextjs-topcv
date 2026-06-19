"use client";

import { useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import { useMetadataStore } from "@/app/stores/metadata.store";
import {
  initialJobFilters,
  type JobFilters,
  useJobFilterStore,
} from "@/app/stores/job.store";

type FilterType = "province" | "salary" | "experience" | "category";

type ChipItem = {
  value: string;
  label: string;
};

const FILTER_TABS = [
  { label: "Địa điểm", value: "province" },
  { label: "Mức lương", value: "salary" },
  { label: "Kinh nghiệm", value: "experience" },
  { label: "Ngành nghề", value: "category" },
];

export default function HomeFilterBar() {
  const { filters, replaceFilters } = useJobFilterStore();
  const { data, loading } = useMetadataStore();

  const [type, setType] = useState<FilterType>("province");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filterKey: keyof JobFilters =
    type === "salary"
      ? "salaryRange"
      : type === "experience"
        ? "experienceLevel"
        : type === "category"
          ? "parentCategoryId"
          : "provinceId";

  const applySingleFilter = (value: string) => {
    replaceFilters({
      ...initialJobFilters,
      search: filters.search,
      [filterKey]: value,
      page: 1,
    });
  };

  const items = useMemo<ChipItem[]>(() => {
    if (!data) return [];

    switch (type) {
      case "salary":
        return data.SalaryRangeOptions;

      case "experience":
        return data.EXPERIENCE_OPTIONS;

      case "category":
        return data.categoryParents.map((item) => ({
          value: String(item.id),
          label: item.name,
        }));

      default:
        return data.provinces.map((item) => ({
          value: String(item.id),
          label: item.name,
        }));
    }
  }, [data, type]);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  if (loading || !data) {
    return <div className="h-10 animate-pulse bg-gray-200 rounded-xl" />;
  }

  return (
    <section>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="relative w-full lg:w-64 shrink-0">
          <SlidersHorizontal
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as FilterType);
              replaceFilters({
                ...initialJobFilters,
                search: filters.search,
                page: 1,
              });
            }}
            className="h-10 w-full bg-white appearance-none rounded-lg border border-gray-200 pl-10 pr-10 text-sm outline-none focus:border-green-500"
          >
            {FILTER_TABS.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <NavButton onClick={() => scroll("left")}>
            <ChevronLeft size={20} />
          </NavButton>

          <div
            ref={scrollRef}
            className="hide-scrollbar flex flex-1 touch-pan-x gap-3 overflow-x-auto"
          >
            <Chip
              label="Tất cả"
              active={!filters[filterKey]}
              onClick={() => applySingleFilter("")}
            />

            {items.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                active={String(filters[filterKey]) === item.value}
                onClick={() => applySingleFilter(item.value)}
              />
            ))}
          </div>

          <NavButton onClick={() => scroll("right")}>
            <ChevronRight size={20} />
          </NavButton>
        </div>
      </div>
    </section>
  );
}

function NavButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick(): void;
}) {
  return (
    <button
      onClick={onClick}
      className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#00b14f] text-[#00b14f] transition hover:bg-[#00b14f] hover:text-white sm:flex"
    >
      {children}
    </button>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick(): void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full px-3 text-xs font-medium whitespace-nowrap transition sm:h-10 sm:px-4 sm:text-sm ${
        active
          ? "bg-[#00b14f] text-white"
          : "bg-[#e9eaec] text-[#212f3f] hover:bg-green-50 hover:text-[#00b14f]"
      }`}
    >
      {label}
    </button>
  );
}
