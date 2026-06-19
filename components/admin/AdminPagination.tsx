"use client";

import { adminBorderSubtle } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

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

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3 border-t px-4 py-4",
        adminBorderSubtle,
      )}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
      >
        {"Trước"}
      </button>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Trang{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
          {currentPage}
        </span>{" "}
        / {lastPage}
      </span>
      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
      >
        Sau
      </button>
    </div>
  );
}
