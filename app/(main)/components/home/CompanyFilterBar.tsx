"use client";

import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useMetadataStore } from "@/app/stores/metadata.store";
import { useCompanyFilterStore } from "@/app/stores/company.store";

export default function CompanyFilterBar() {
  const { filters, setFilter } = useCompanyFilterStore();
  const { data, loading, fetchMeta } = useMetadataStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchMeta();
  }, [fetchMeta]);

  const items = useMemo(() => {
    if (!data) return [];

    return data.categoryParents.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [data]);

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
      <div className="flex items-center gap-3">
        <div
          ref={scrollRef}
          className="hide-scrollbar flex flex-1 touch-pan-x gap-3 overflow-x-auto"
        >
          <Chip
            label="Tất cả"
            active={!filters.categoryId}
            onClick={() => setFilter("categoryId", "")}
          />

          {items.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              active={String(filters.categoryId) === item.value}
              onClick={() => setFilter("categoryId", item.value)}
            />
          ))}
        </div>

        <NavButton onClick={() => scroll("left")}>
          <ChevronLeft size={20} />
        </NavButton>

        <NavButton onClick={() => scroll("right")}>
          <ChevronRight size={20} />
        </NavButton>
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
      className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#8d660d] text-[#8d660d] transition hover:bg-[#8d660d] hover:text-white sm:flex"
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
      className={`h-9 shrink-0 px-4 rounded-full text-sm font-medium bg-[#212f3f] whitespace-nowrap transition border cursor-pointer ${
        active
          ? "bg-[#8d660d] text-white border-[#8d660d]"
          : "bg-gray-100 text-[#212f3f] border-transparent hover:bg-yellow-50 hover:text-[#8d660d]"
      }`}
    >
      {label}
    </button>
  );
}
