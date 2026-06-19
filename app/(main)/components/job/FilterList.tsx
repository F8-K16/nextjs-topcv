"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Item = {
  value: string;
  label: string;
};

type Props = {
  items: Item[];
  current: string | null;
  onSelect: (value: string) => void;
  limit?: number;
  groupLabel: string;
};

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1 ${
        selected
          ? "border-primary/50 bg-primary/8 font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(0,191,20,0.12)]"
          : "border-zinc-100/90 bg-zinc-50/90 text-zinc-700 hover:border-zinc-200 hover:bg-white"
      }`}
    >
      <span
        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full border-2 transition ${
          selected
            ? "border-primary bg-primary"
            : "border-zinc-300 bg-white"
        }`}
        aria-hidden
      />
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

export default function FilterList({
  items,
  current,
  onSelect,
  limit = 6,
  groupLabel,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, limit);

  return (
    <div
      className="space-y-1.5"
      role="radiogroup"
      aria-label={groupLabel}
    >
      <OptionButton
        label="Tất cả"
        selected={!current}
        onClick={() => onSelect("")}
      />

      {visibleItems.map((item) => {
        const isActive = item.value === current;
        return (
          <OptionButton
            key={item.value}
            label={item.label}
            selected={isActive}
            onClick={() => onSelect(item.value)}
          />
        );
      })}

      {items.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}
