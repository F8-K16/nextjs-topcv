"use client";

import { adminBorderSubtle } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  const currentPage = Number(page) || 1;
  const lastPage = Number(totalPages) || 1;

  if (lastPage <= 1) return null;

  const btn =
    "inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 text-[12px] font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3",
        adminBorderSubtle,
      )}
    >
      <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
        Trang{" "}
        <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
          {currentPage}
        </span>
        <span className="text-zinc-400"> / {lastPage}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={btn}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Trước
        </button>
        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className={btn}
        >
          Sau
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
