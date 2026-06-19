"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef } from "react";

import { useFixedDropdownPlacement } from "@/hooks/use-fixed-dropdown-placement";
import { cn } from "@/lib/utils";

export type HeroLocationOption = { id: string; name: string };

type Props = {
  placeholder: string;
  value: string;
  options: HeroLocationOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iconVariant?: "primary" | "muted";
  shellClassName?: string;
  emptyMessage?: string;
};

export default function HeroLocationCombobox({
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  open,
  onOpenChange,
  iconVariant = "primary",
  shellClassName,
  emptyMessage = "Chưa có dữ liệu.",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const panelStyle = useFixedDropdownPlacement(
    open && !disabled,
    rootRef,
    560,
    true,
  );

  const selected = options.find((o) => o.id === value);
  const label = selected?.name ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (rootRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const iconClass =
    iconVariant === "muted" ? "text-primary/80" : "text-primary";

  return (
    <div ref={rootRef} className={cn("relative", shellClassName)}>
      <MapPin
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
          iconClass,
          disabled && "opacity-40",
        )}
      />
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => !disabled && onOpenChange(!open)}
        className={cn(
          "flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-2 bg-transparent py-2.5 pl-10 pr-10 text-left text-sm outline-none transition sm:min-h-[52px] sm:py-3 md:py-4 md:text-base",
          "focus-visible:bg-zinc-50/90 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          disabled
            ? "cursor-not-allowed text-zinc-400"
            : "text-zinc-800 hover:bg-zinc-50/70 active:bg-zinc-50",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selected && "font-normal text-zinc-500",
            selected && "font-semibold text-zinc-900",
          )}
        >
          {label}
        </span>
      </button>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-transform duration-200",
          open && "rotate-180",
          disabled && "opacity-40",
        )}
      />

      {open &&
      !disabled &&
      typeof document !== "undefined" &&
      panelStyle
        ? createPortal(
            <div
              ref={panelRef}
              id={listId}
              role="listbox"
              aria-label={placeholder}
              style={panelStyle}
              className="overflow-y-auto overscroll-contain rounded-xl border border-zinc-200/90 bg-white py-1.5 shadow-xl shadow-zinc-900/12 ring-1 ring-black/[0.05]"
            >
              {loading && options.length === 0 ? (
                <div className="space-y-2 px-4 py-6">
                  <div className="mx-auto h-2 w-3/4 animate-pulse rounded-full bg-zinc-100" />
                  <div className="mx-auto h-2 w-1/2 animate-pulse rounded-full bg-zinc-100" />
                  <div className="mx-auto h-2 w-2/3 animate-pulse rounded-full bg-zinc-100" />
                  <p className="text-center text-xs text-zinc-500">Đang tải…</p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === ""}
                    onClick={() => {
                      onChange("");
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-3 py-2.5 text-left text-sm transition",
                      value === ""
                        ? "bg-emerald-50 font-medium text-emerald-900"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{placeholder}</span>
                    {value === "" ? (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
                    ) : null}
                  </button>

                  <div className="mx-3 border-t border-zinc-100" />

                  {options.length === 0 && !loading ? (
                    <p className="px-4 py-6 text-center text-sm text-zinc-500">
                      {emptyMessage}
                    </p>
                  ) : (
                    options.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        role="option"
                        aria-selected={value === o.id}
                        onClick={() => {
                          onChange(o.id);
                          onOpenChange(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition",
                          value === o.id
                            ? "bg-emerald-50/90 font-semibold text-emerald-950"
                            : "text-zinc-800 hover:bg-emerald-50/60 hover:text-emerald-950",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{o.name}</span>
                        {value === o.id ? (
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                        ) : null}
                      </button>
                    ))
                  )}
                </>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
