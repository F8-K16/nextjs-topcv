"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  MapPin,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import { useMetadataStore } from "@/app/stores/metadata.store";
import {
  initialJobFilters,
  type JobFilters,
  useJobFilterStore,
} from "@/app/stores/job.store";
import { cn } from "@/lib/utils";

type FilterType = "province" | "salary" | "experience" | "category";

type ChipItem = {
  value: string;
  label: string;
};

const FILTER_TABS: { label: string; value: FilterType; icon: LucideIcon }[] = [
  { label: "Địa điểm", value: "province", icon: MapPin },
  { label: "Mức lương", value: "salary", icon: Banknote },
  { label: "Kinh nghiệm", value: "experience", icon: Briefcase },
  { label: "Ngành nghề", value: "category", icon: LayoutGrid },
];

export default function HomeFilterBar() {
  const { filters, replaceFilters } = useJobFilterStore();
  const { data, loading, fetchMeta } = useMetadataStore();

  const [type, setType] = useState<FilterType>("province");
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedTab =
    FILTER_TABS.find((tab) => tab.value === type) ?? FILTER_TABS[0];

  useEffect(() => {
    void fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectType = (next: FilterType) => {
    setOpen(false);
    if (next === type) return;
    setType(next);
    replaceFilters({
      ...initialJobFilters,
      search: filters.search,
      page: 1,
    });
  };

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
        <div
          ref={menuRef}
          className={cn("relative w-full shrink-0 lg:w-72", open && "z-20")}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((value) => !value)}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-xl border bg-white pl-4 pr-3 text-sm outline-none transition",
              open
                ? "border-primary ring-2 ring-primary/20"
                : "border-zinc-200 hover:border-zinc-300",
            )}
          >
            <SlidersHorizontal size={16} className="shrink-0 text-zinc-400" />
            <span className="shrink-0 text-zinc-500">Lọc theo:</span>
            <span className="min-w-0 flex-1 truncate text-left font-medium text-zinc-900">
              {selectedTab.label}
            </span>
            <ChevronDown
              size={18}
              className={cn(
                "shrink-0 text-zinc-500 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>

          {open ? (
            <div
              role="listbox"
              aria-label="Lọc theo"
              className="absolute top-[calc(100%+8px)] left-0 z-30 w-full rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-xl shadow-zinc-900/10 ring-1 ring-black/[0.05]"
            >
              {FILTER_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.value === type;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => selectType(tab.value)}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition",
                      active
                        ? "bg-[#00b14f]/10 font-semibold text-[#087a38]"
                        : "text-[#212f3f] hover:bg-green-50 hover:text-[#00b14f]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                        active
                          ? "bg-[#00b14f] text-white"
                          : "bg-[#e9eaec] text-zinc-600 group-hover:bg-white group-hover:text-[#00b14f]",
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        active
                          ? "border-[#00b14f] bg-[#00b14f] text-white"
                          : "border-zinc-300 bg-white text-transparent group-hover:border-[#00b14f]",
                      )}
                    >
                      <Check
                        size={14}
                        strokeWidth={3}
                        className={active ? "text-white" : "opacity-0"}
                        aria-hidden={!active}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
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
