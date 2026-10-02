"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type OptionSelectItem = {
  value: string;
  label: string;
};

export default function OptionSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn",
  disabled = false,
  ariaLabel,
  className,
  triggerClassName,
  size = "md",
  allowClear = true,
}: {
  value: string;
  onChange: (value: string) => void;
  options: OptionSelectItem[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  size?: "sm" | "md";
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((item) => item.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (rootRef.current?.contains(event.target)) return;
      const menu = document.getElementById(listId);
      if (menu?.contains(event.target)) return;
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
  }, [open, listId]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }

    const update = () => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gap = 8;
      const spaceBelow = window.innerHeight - r.bottom - gap;
      const spaceAbove = r.top - gap;
      const maxHeight = Math.min(256, Math.max(spaceBelow, spaceAbove, 120));
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      setMenuPos({
        top: openUp ? Math.max(8, r.top - maxHeight - gap) : r.bottom + gap,
        left: r.left,
        width: Math.max(r.width, 140),
        maxHeight,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const menu =
    open && !disabled && menuPos ? (
      <div
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        style={{
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          maxHeight: menuPos.maxHeight,
        }}
        className="employer-app fixed z-[80] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-xl shadow-zinc-900/10 ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/40 dark:ring-white/10"
      >
        {allowClear ? (
          <OptionRow
            label={placeholder}
            active={!value}
            onSelect={() => {
              onChange("");
              setOpen(false);
            }}
          />
        ) : null}
        {options.map((item) => (
          <OptionRow
            key={item.value}
            label={item.label}
            active={item.value === value}
            onSelect={() => {
              onChange(item.value);
              setOpen(false);
            }}
          />
        ))}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={cn("relative", open && "z-30", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border bg-white text-left outline-none transition",
          size === "sm" ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-zinc-200 hover:border-zinc-300 dark:hover:border-white/25",
          disabled &&
            "cursor-not-allowed bg-zinc-50 text-zinc-400 hover:border-zinc-200",
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "font-medium text-zinc-900" : "text-zinc-500",
            disabled && "text-zinc-400",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={size === "sm" ? 14 : 18}
          className={cn(
            "shrink-0 text-zinc-500 transition-transform duration-200",
            open && "rotate-180",
            disabled && "text-zinc-300",
          )}
        />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}

function OptionRow({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition",
        active
          ? "bg-[#00b14f]/10 font-semibold text-[#087a38] dark:text-emerald-300"
          : "text-[#212f3f] hover:bg-green-50 hover:text-[#00b14f] dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-emerald-300",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
          active
            ? "border-[#00b14f] bg-[#00b14f] text-white"
            : "border-zinc-300 bg-white text-transparent group-hover:border-[#00b14f] dark:border-white/20 dark:bg-zinc-800",
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
}
