"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { employerPortalService } from "@/services/employer-portal.service";
import { EmployerQueryError, EmployerQueryLoading } from "../employer-query-ui";
import { getErrorToastMessage } from "@/lib/submit-error";
import { formatDate } from "@/utils/helper";
import { cn } from "@/lib/utils";
import {
  STALE_EMPLOYER_APPLICATIONS_MS,
  STALE_EMPLOYER_JOBS_PICKER_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { usePublicFeatures } from "@/hooks/usePublicFeatures";
import StartConversationNav from "@/app/(main)/components/chat/StartConversationNav";

import EmployerApplicationDetailModal, {
  EmployerApplicationPreviewPane,
} from "./EmployerApplicationDetailModal";
import OptionSelect from "@/components/ui/option-select";

type AppRow = {
  id: number;
  status: string;
  createdAt: string;
  coverLetter?: string | null;
  aiMatchStatus?: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  aiMatchScore?: number | null;
  candidate: {
    user: {
      id: number;
      username: string;
      email: string;
      userPhone?: { phone: string } | null;
    };
    province?: { name: string } | null;
    district?: { name: string } | null;
  };
  job: { id: number; title: string };
  resume?: { title: string; fileUrl: string } | null;
};

const PAGE_SIZE = 20;

const APP_STATUSES = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"] as const;

function appStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Chờ",
    REVIEWED: "Đã xem",
    ACCEPTED: "Đạt",
    REJECTED: "Loại",
  };
  return map[status] ?? status;
}

function appBadgeClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200";
    case "REVIEWED":
      return "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200";
    case "REJECTED":
      return "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200";
  }
}

function buildQs(page: number, jobId: string, status: string): string {
  const p = new URLSearchParams();
  p.set("page", String(Math.max(1, page)));
  p.set("limit", String(PAGE_SIZE));
  if (jobId && !Number.isNaN(Number(jobId))) p.set("jobId", jobId);
  if (status && (APP_STATUSES as readonly string[]).includes(status)) {
    p.set("status", status);
  }
  return p.toString();
}

export default function EmployerApplicationsPageClient() {
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const userId = useAuthStore((s) => s.user?.id);
  const { ai } = usePublicFeatures();
  const [detailApplicationId, setDetailApplicationId] = useState<number | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const page = Math.max(1, Number(sp.get("page")) || 1);
  const jobId = sp.get("jobId") ?? "";
  const status = sp.get("status") ?? "";

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

  const { data: jobsPicker } = useQuery({
    queryKey: ["employer-portal-jobs", "picker", userId],
    queryFn: () => employerPortalService.listJobs("page=1&limit=100"),
    retry: 1,
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_JOBS_PICKER_MS,
  });

  const qs = useMemo(() => buildQs(page, jobId, status), [page, jobId, status]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-portal-applications", userId, qs],
    queryFn: () => employerPortalService.listApplications(qs),
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_APPLICATIONS_MS,
  });

  const onStatus = async (id: number, next: string) => {
    try {
      await employerPortalService.updateApplicationStatus(id, next);
      toast.success("Đã cập nhật");
      await qc.invalidateQueries({
        queryKey: ["employer-portal-applications"],
      });
      await qc.invalidateQueries({ queryKey: ["employer-portal-dashboard"] });
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Không cập nhật được trạng thái");
    }
  };

  if (userId == null || isPending) {
    return <EmployerQueryLoading />;
  }

  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const rows = data.applications as AppRow[];
  const resolvedSelectedId =
    selectedId != null && rows.some((row) => row.id === selectedId)
      ? selectedId
      : (rows[0]?.id ?? null);
  const { pagination } = data;
  const { page: cur, totalPages, total } = pagination;

  const jobOptions = (jobsPicker?.jobs ?? []) as Array<{
    id: number;
    title: string;
  }>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Hồ sơ ứng tuyển
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Xem CV và thư ứng tuyển từ ứng viên.
        </p>
      </div>

      <div className="sticky top-0 z-20 rounded-2xl border border-zinc-200/80 bg-zinc-50/95 px-3 py-3 text-sm shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-zinc-50/85">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Lọc theo tin
            </label>
            <OptionSelect
              ariaLabel="Lọc theo tin"
              placeholder="Tất cả tin"
              className="min-w-55"
              value={jobId}
              options={jobOptions.map((j) => ({
                value: String(j.id),
                label: j.title,
              }))}
              onChange={(next) =>
                setParams({ jobId: next || null, page: null })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Trạng thái hồ sơ
            </label>
            <OptionSelect
              ariaLabel="Trạng thái hồ sơ"
              placeholder="Tất cả"
              className="min-w-45"
              value={status}
              options={APP_STATUSES.map((s) => ({
                value: s,
                label: appStatusLabel(s),
              }))}
              onChange={(next) =>
                setParams({ status: next || null, page: null })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {rows.length === 0 ? (
            <p className="px-4 py-14 text-center text-sm text-zinc-500">
              Không có hồ sơ
            </p>
          ) : (
            <ul className="max-h-[min(40rem,70vh)] space-y-2 overflow-y-auto p-2">
              {rows.map((row) => {
                const name = row.candidate.user.username || "Ứ";
                const active = row.id === resolvedSelectedId;
                return (
                  <li
                    key={row.id}
                    className={cn(
                      "overflow-hidden rounded-xl border border-[#00b14f]/20 bg-linear-to-br from-[#00b14f]/14 via-white to-[#087a38]/10 shadow-xs transition dark:from-[#00b14f]/20 dark:via-zinc-900 dark:to-[#087a38]/15",
                      active
                        ? "ring-2 ring-[#00b14f]/60 ring-offset-1 dark:ring-offset-zinc-900"
                        : "hover:bg-white/0 hover:shadow-sm dark:hover:bg-white/[0.04]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(row.id);
                        if (!window.matchMedia("(min-width: 1024px)").matches) {
                          setDetailApplicationId(row.id);
                        }
                      }}
                      className="flex w-full items-start gap-3 px-3 py-3 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00b14f]/15 text-sm font-semibold text-[#087a38]">
                        {name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-zinc-900">
                            {name}
                          </span>
                          {ai && typeof row.aiMatchScore === "number" ? (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              AI {row.aiMatchScore}%
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-zinc-500">
                          {row.job.title}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              appBadgeClass(row.status),
                            )}
                          >
                            {appStatusLabel(row.status)}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {formatDate(row.createdAt)}
                          </span>
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center justify-between gap-2 px-3 pb-3">
                      <OptionSelect
                        ariaLabel={`Trạng thái hồ sơ ${name}`}
                        allowClear={false}
                        size="sm"
                        className="w-32"
                        value={row.status}
                        options={APP_STATUSES.map((s) => ({
                          value: s,
                          label: appStatusLabel(s),
                        }))}
                        onChange={(next) => {
                          if (next) void onStatus(row.id, next);
                        }}
                      />
                      <StartConversationNav
                        peerUserId={row.candidate.user.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 disabled:cursor-wait disabled:opacity-80"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Nhắn tin
                      </StartConversationNav>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="hidden min-h-[32rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:block">
          <EmployerApplicationPreviewPane applicationId={resolvedSelectedId} />
        </div>
      </div>

      <EmployerApplicationDetailModal
        applicationId={detailApplicationId}
        open={detailApplicationId != null}
        onOpenChange={(o) => {
          if (!o) setDetailApplicationId(null);
        }}
      />

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
          <span>
            {"Trang "}
            {cur}
            {" / "}
            {Math.max(1, totalPages)}
            {" — "}
            {total}
            {" hồ sơ"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={cur <= 1}
              onClick={() =>
                setParams({ page: cur <= 2 ? null : String(cur - 1) })
              }
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40 dark:hover:bg-white/10"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={cur >= totalPages}
              onClick={() => setParams({ page: String(cur + 1) })}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40 dark:hover:bg-white/10"
            >
              {"Sau"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
