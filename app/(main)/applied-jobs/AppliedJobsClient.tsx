"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { applicationService } from "@/services/application.service";
import type { ApplicationStatus } from "@/app/types/application.type";
import { formatDate } from "@/utils/helper";
import { Loader2, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { STALE_MY_APPLICATIONS_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";
import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";
import { jobPublicPath } from "@/lib/job-path";
import { usePublicFeatures } from "@/hooks/usePublicFeatures";
import { getErrorToastMessage } from "@/lib/submit-error";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { getSiteUrl } from "@/lib/job-posting";

const STATUS_FILTER: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "REVIEWED", label: "Đã xem" },
  { value: "ACCEPTED", label: "Đạt" },
  { value: "REJECTED", label: "Từ chối" },
];

const statusLabel: Record<ApplicationStatus, string> = {
  PENDING: "Chờ duyệt",
  REVIEWED: "Đã xem",
  ACCEPTED: "Trúng tuyển",
  REJECTED: "Từ chối",
};

export default function AppliedJobsClient() {
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { ai } = usePublicFeatures();
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const hideCandidateFeatures = useAuthenticatedNonCandidate();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: () => applicationService.getMyApplications(),
    staleTime: STALE_MY_APPLICATIONS_MS,
    enabled: !!user?.id && isCandidate,
  });

  const filtered = useMemo(() => {
    if (status === "ALL") return data;
    return data.filter((a) => a.status === status);
  }, [data, status]);

  const selectedApps = useMemo(
    () => filtered.filter((a) => selected.has(a.id)),
    [filtered, selected],
  );
  const pendingSelected = selectedApps.filter((a) => a.status === "PENDING");

  const allVisibleIds = filtered.map((a) => a.id);
  const allSelected =
    allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allVisibleIds));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const withdrawMut = useMutation({
    mutationFn: () =>
      applicationService.bulkWithdraw(pendingSelected.map((a) => a.id)),
    onSuccess: (result) => {
      toast.success(
        result.withdrawn > 0
          ? `Đã rút ${result.withdrawn} đơn chờ duyệt`
          : "Không có đơn chờ duyệt trong phần chọn",
      );
      if (result.skipped > 0) {
        toast.message(
          `${result.skipped} đơn đã xử lý (đã xem/đạt/từ chối) được giữ lại`,
        );
      }
      setSelected(new Set());
      setConfirmWithdraw(false);
      void qc.invalidateQueries({ queryKey: ["my-applications"] });
      void qc.invalidateQueries({ queryKey: ["applied-job-ids"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không rút được đơn"),
  });

  const copySelectedLinks = async () => {
    if (selectedApps.length === 0) return;
    const site = getSiteUrl();
    const text = selectedApps
      .map((app) => `${app.job.title} — ${site}${jobPublicPath(app.job)}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Đã copy đường dẫn tin đã chọn");
    } catch {
      toast.error("Không copy được vào clipboard");
    }
  };

  if (hideCandidateFeatures) {
    return (
      <CandidateOnlyNotice>
        Theo dõi đơn ứng tuyển chỉ dành cho tài khoản ứng viên. Với nhà tuyển
        dụng, hãy dùng khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-9 w-9 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminConfirmDialog
        open={confirmWithdraw}
        onOpenChange={setConfirmWithdraw}
        title="Rút đơn đang chờ duyệt?"
        description="Chỉ các đơn trạng thái Chờ duyệt mới bị xóa. Bạn có thể ứng tuyển lại tin đó sau. Đơn đã được nhà tuyển dụng xem hoặc kết thúc sẽ được giữ."
        confirmLabel="Rút đơn"
        variant="destructive"
        loading={withdrawMut.isPending}
        onConfirm={() => withdrawMut.mutate()}
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTER.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setStatus(opt.value);
              setSelected(new Set());
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === opt.value
                ? "bg-[#00b14f] text-white shadow-sm"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
          {data.length === 0
            ? "Bạn chưa ứng tuyển tin nào."
            : "Không có đơn trong bộ lọc này."}
          {data.length === 0 ? (
            <div className="mt-4">
              <Link
                href="/jobs"
                className="text-sm font-semibold text-[#00b14f] hover:underline"
              >
                Khám phá việc làm
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 text-[#00b14f] focus:ring-[#00b14f]"
              />
              Chọn tất cả hiển thị
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">
                Đã chọn {selected.size}
                {pendingSelected.length > 0
                  ? ` · ${pendingSelected.length} chờ duyệt`
                  : ""}
              </span>
              <button
                type="button"
                disabled={selectedApps.length === 0}
                onClick={() => void copySelectedLinks()}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-white disabled:opacity-40"
              >
                Copy link tin
              </button>
              <button
                type="button"
                disabled={pendingSelected.length === 0}
                onClick={() => setConfirmWithdraw(true)}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100 disabled:opacity-40"
              >
                Rút đơn chờ duyệt
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {filtered.map((app) => (
              <li
                key={app.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <input
                  type="checkbox"
                  checked={selected.has(app.id)}
                  onChange={() => toggleOne(app.id)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-[#00b14f] focus:ring-[#00b14f] sm:mt-0"
                  aria-label={`Chọn đơn ${app.job.title}`}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={jobPublicPath(app.job)}
                    className="font-semibold text-gray-900 hover:text-[#00b14f]"
                  >
                    {app.job.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-600">
                    {app.job.company.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Nộp ngày {formatDate(app.createdAt)}
                    {app.resume ? ` · CV: ${app.resume.title}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  {ai && typeof app.aiMatchScore === "number" ? (
                    <span className="rounded-full bg-[#00b14f]/10 px-3 py-1 text-xs font-semibold text-[#00b14f]">
                      AI Match {app.aiMatchScore}%
                    </span>
                  ) : ai &&
                    (app.aiMatchStatus === "RUNNING" ||
                      app.aiMatchStatus === "PENDING") ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      AI đang chấm
                    </span>
                  ) : ai && app.aiMatchStatus === "FAILED" ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                      AI lỗi
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      app.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : app.status === "REVIEWED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {statusLabel[app.status]}
                  </span>
                  <Link
                    href={jobPublicPath(app.job)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#00b14f] hover:underline"
                  >
                    Xem tin
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
