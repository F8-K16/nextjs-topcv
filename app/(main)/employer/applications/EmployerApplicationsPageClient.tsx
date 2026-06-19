"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { employerPortalService } from "@/services/employer-portal.service";
import { EmployerQueryError, EmployerQueryLoading } from "../employer-query-ui";
import { getErrorToastMessage } from "@/lib/submit-error";
import {
  STALE_EMPLOYER_APPLICATIONS_MS,
  STALE_EMPLOYER_JOBS_PICKER_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import StartConversationNav from "@/app/(main)/components/chat/StartConversationNav";

import EmployerApplicationDetailModal from "./EmployerApplicationDetailModal";

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
  const [detailApplicationId, setDetailApplicationId] = useState<number | null>(
    null,
  );

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
          Xem CV và thư ứng tuyển trong một cửa sổ — không cần mở link chia sẻ.
        </p>
      </div>

      <div className="sticky top-0 z-20 rounded-2xl border border-zinc-200/80 bg-zinc-50/95 px-3 py-3 text-sm shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-zinc-50/85">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Lọc theo tin
            </label>
            <select
              value={jobId}
              onChange={(e) =>
                setParams({ jobId: e.target.value || null, page: null })
              }
              className="min-w-55 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm scheme:light"
            >
              <option value="">{"Tất cả tin"}</option>
              {jobOptions.map((j) => (
                <option key={j.id} value={String(j.id)}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Trạng thái hồ sơ
            </label>
            <select
              value={status}
              onChange={(e) =>
                setParams({ status: e.target.value || null, page: null })
              }
              className="min-w-45 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm scheme:light"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ</option>
              <option value="REVIEWED">Đã xem</option>
              <option value="ACCEPTED">Đạt</option>
              <option value="REJECTED">Loại</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Tin</th>
              <th className="px-4 py-3">Ứng viên</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Hồ sơ</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Không có hồ sơ
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80">
                  <td className="px-4 py-3 text-zinc-700">{row.job.title}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">
                      {row.candidate.user.username}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {row.candidate.user.email}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {row.candidate.user.userPhone?.phone
                      ? `${row.candidate.user.userPhone.phone}`
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDetailApplicationId(row.id)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {typeof row.aiMatchScore === "number" ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        AI {row.aiMatchScore}%
                      </span>
                    ) : row.aiMatchStatus === "RUNNING" ||
                      row.aiMatchStatus === "PENDING" ? (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                        AI đang chấm
                      </span>
                    ) : row.aiMatchStatus === "FAILED" ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                        AI lỗi
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      onChange={(e) => onStatus(row.id, e.target.value)}
                      className="max-w-36 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs scheme:light"
                    >
                      <option value="PENDING">Chờ</option>
                      <option value="REVIEWED">Đã xem</option>
                      <option value="ACCEPTED">Đạt</option>
                      <option value="REJECTED">Loại</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StartConversationNav
                      peerUserId={row.candidate.user.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 disabled:cursor-wait disabled:opacity-80"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Nhắn tin
                    </StartConversationNav>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
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
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
            >
              Trước
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
