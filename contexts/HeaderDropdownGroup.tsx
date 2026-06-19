"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useHeaderDropdownStore } from "@/app/stores/header-dropdown.store";

export default function HeaderDropdownGroup({
  children,
}: {
  children: ReactNode;
}) {
  const openId = useHeaderDropdownStore((s) => s.openId);
  const close = useHeaderDropdownStore((s) => s.close);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [openId, close]);

  return (
    <div
      ref={containerRef}
      className="flex shrink-0 items-center gap-1 overflow-visible md:gap-2"
    >
      {children}
    </div>
  );
}
