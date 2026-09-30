"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { invalidateEmployerPortalJobQueries } from "@/lib/employer-portal-queries";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { employerPortalService } from "@/services/employer-portal.service";
import { JOB_MODERATION_OPTIONS } from "@/app/types/job.type";
import {
  EmployerQueryError,
  EmployerQueryLoading,
} from "../employer-query-ui";
import { getErrorToastMessage } from "@/lib/submit-error";
import {
  STALE_EMPLOYER_JOBS_LIST_MS,
  STALE_EMPLOYER_ME_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { requestAppConfirm } from "@/app/stores/confirm-dialog.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OptionSelect from "@/components/ui/option-select";
import { formatSalaryShort } from "@/utils/helper";

const PAGE_SIZE = 12;

const MOD_OPTIONS = ["PENDING", "APPROVED", "REJECTED"] as const;

function modLabel(v: string | undefined) {
  return JOB_MODERATION_OPTIONS.find((o) => o.value === v)?.label ?? v ?? "—";
}

function modBadgeClass(v: string | undefined) {
  switch (v) {
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "APPROVED":
      return "bg-emerald-100 text-emerald-900";
    case "REJECTED":
      return "bg-red-100 text-red-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function buildQs(
  page: number,
  search: string,
  moderationStatus: string,
): string {
  const p = new URLSearchParams();
  p.set("page", String(Math.max(1, page)));
  p.set("limit", String(PAGE_SIZE));
  const q = search.trim();
  if (q) p.set("search", q);
  if (
    moderationStatus &&
    (MOD_OPTIONS as readonly string[]).includes(moderationStatus)
  ) {
    p.set("moderationStatus", moderationStatus);
  }
  return p.toString();
}

export default function EmployerJobsPageClient() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const userId = useAuthStore((s) => s.user?.id);

  const page = Math.max(1, Number(sp.get("page")) || 1);
  const search = sp.get("search") ?? "";
  const moderationStatus = sp.get("moderationStatus") ?? "";

  const setParams = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const n = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") n.delete(k);
        else n.set(k, v);
      }
      const s = n.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [router, pathname, sp],
  );

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const qs = useMemo(
    () => buildQs(page, search, moderationStatus),
    [page, search, moderationStatus],
  );

  const { data: me } = useQuery({
    queryKey: ["employer-portal-me", userId],
    queryFn: () => employerPortalService.me(),
    staleTime: STALE_EMPLOYER_ME_MS,
    enabled: userId != null,
  });

  const companyLocked = me?.company?.status === false;

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-portal-jobs", userId, qs],
    queryFn: () => employerPortalService.listJobs(qs),
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_JOBS_LIST_MS,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => employerPortalService.deleteJob(id),
    onSuccess: async () => {
      toast.success("Đã xóa tin");
      await invalidatePublicJobListQueries(qc);
      await invalidateEmployerPortalJobQueries(qc);
    },
    onError: (e: unknown) => {
      toast.error(getErrorToastMessage(e) || "Không xóa được tin");
    },
  });

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({
      search: searchInput.trim() || null,
      page: null,
    });
  };

  const onDelete = async (id: number, title: string) => {
    const ok = await requestAppConfirm({
      title: "Xóa tin tuyển dụng?",
      description: `Xóa tin "${title}"? Hành động không thể hoàn tác.`,
      confirmLabel: "Xóa tin",
      variant: "destructive",
    });
    if (!ok) return;
    deleteMut.mutate(id);
  };

  if (userId == null || isPending) {
    return <EmployerQueryLoading />;
  }

  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const { pagination } = data;
  const { page: cur, totalPages, total } = pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900">
          {"Tin tuyển dụng"}
        </h1>
        {companyLocked ? (
          <span
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-500"
            title="Công ty đang bị khóa"
          >
            <Plus className="h-4 w-4" />
            {"Đăng tin mới"}
          </span>
        ) : (
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {"Đăng tin mới"}
          </Link>
        )}
      </div>

      <div className="sticky top-0 z-20 -mx-1 rounded-2xl border border-zinc-200/80 bg-zinc-50/95 px-3 py-3 text-sm shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-zinc-50/85">
        <form
          onSubmit={onSearchSubmit}
          className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
        >
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              {"Tìm theo tiêu đề"}
            </label>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={"Nhập từ khóa…"}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="min-w-[11rem]">
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              {"Trạng thái duyệt"}
            </label>
            <OptionSelect
              ariaLabel="Trạng thái duyệt"
              placeholder="Tất cả"
              value={moderationStatus}
              options={JOB_MODERATION_OPTIONS}
              onChange={(next) =>
                setParams({
                  moderationStatus: next || null,
                  page: null,
                })
              }
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              {"Tìm"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {data.jobs.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-medium text-zinc-800">Chưa có tin tuyển dụng</p>
            <p className="mt-1 text-sm text-zinc-500">
              Đăng tin đầu tiên để bắt đầu nhận hồ sơ.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {data.jobs.map((row) => {
              const job = row as {
                id: number;
                title: string;
                viewCount?: number;
                minSalary?: number;
                maxSalary?: number;
                workLocation?: string | null;
                moderationStatus: string;
                category?: { name: string };
                _count?: { applications: number };
              };
              const meta = [
                formatSalaryShort(job.minSalary, job.maxSalary),
                job.workLocation,
                job.category?.name,
                `${job._count?.applications ?? 0} hồ sơ`,
                `${job.viewCount ?? 0} lượt xem`,
              ].filter(Boolean);

              return (
                <li
                  key={job.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-zinc-900">
                        {job.title}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${modBadgeClass(job.moderationStatus)}`}
                      >
                        {modLabel(job.moderationStatus)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {meta.join(" · ")}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                      aria-label={`Thao tác tin ${job.title}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={companyLocked}
                        onSelect={() => {
                          if (!companyLocked) {
                            router.push(`/employer/jobs/${job.id}/edit`);
                          }
                        }}
                      >
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={deleteMut.isPending || companyLocked}
                        className="text-red-600 focus:text-red-700"
                        onSelect={() => void onDelete(job.id, job.title)}
                      >
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            {"Trang "}
            {cur}
            {" / "}
            {Math.max(1, totalPages)}
            {" — "}
            {total}
            {" tin"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={cur <= 1}
              onClick={() =>
                setParams({ page: cur <= 2 ? null : String(cur - 1) })
              }
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
            >
              {"Trước"}
            </button>
            <button
              type="button"
              disabled={cur >= totalPages}
              onClick={() => setParams({ page: String(cur + 1) })}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
            >
              {"Sau"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
