"use client";

import type { Job } from "@/app/types/job.type";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { getErrorToastMessage } from "@/lib/submit-error";
import { jobService } from "@/services/job.service";
import { formatDate } from "@/utils/helper";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useModal } from "../components/ModalManager";
import { useAuthStore } from "@/app/stores/auth.store";
import { canAdminPermission } from "@/lib/rbac";
import {
  adminModerationBtnApprove,
  adminModerationBtnGhost,
  adminModerationBtnReject,
  adminModerationCountChip,
  adminModerationHeading,
  adminModerationListItem,
  adminModerationPanel,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export default function PendingJobsTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const canApprove = canAdminPermission(roles, permissions, "admin:jobs:approve");
  const canReject =
    canAdminPermission(roles, permissions, "admin:jobs:reject") ||
    canAdminPermission(roles, permissions, "admin:jobs:approve");
  const [confirmBulkApprove, setConfirmBulkApprove] = useState(false);
  const [bulkApproveLoading, setBulkApproveLoading] = useState(false);

  const runBulkApprovePending = async () => {
    setBulkApproveLoading(true);
    try {
      const r = await jobService.approveAllPendingModeration();
      toast.success(
        r.approved === r.totalPending
          ? `Đã duyệt ${r.approved} tin`
          : `Đã duyệt ${r.approved}/${r.totalPending} tin`,
      );
      setConfirmBulkApprove(false);
      await invalidatePublicJobListQueries(queryClient);
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Không duyệt hàng loạt được");
    } finally {
      setBulkApproveLoading(false);
    }
  };

  const approveOne = async (jobId: number) => {
    try {
      await jobService.patchJobModeration(jobId, "APPROVED");
      await invalidatePublicJobListQueries(queryClient);
      toast.success("Đã duyệt tin");
      router.refresh();
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Không duyệt được tin");
    }
  };

  const rejectOne = async (jobId: number) => {
    try {
      await jobService.patchJobModeration(jobId, "REJECTED");
      await invalidatePublicJobListQueries(queryClient);
      toast.success("Đã từ chối tin");
      router.refresh();
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Không từ chối được tin");
    }
  };

  return (
    <div id="moderation-jobs" className={adminModerationPanel}>
      <AdminConfirmDialog
        open={confirmBulkApprove}
        onOpenChange={(o) => !o && setConfirmBulkApprove(false)}
        title="Duyệt tất cả tin chờ?"
        description="Mọi tin đang ở trạng thái chờ (PENDING) trong hệ thống sẽ được chuyển sang đã duyệt. Thông báo gửi theo từng tin."
        confirmLabel="Duyệt tất cả"
        variant="default"
        loading={bulkApproveLoading}
        onConfirm={runBulkApprovePending}
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className={adminModerationHeading}>
          Việc làm chờ duyệt
          <span className={adminModerationCountChip}>{jobs.length}</span>
        </h3>
        {jobs.length > 0 && canApprove ? (
          <button
            type="button"
            onClick={() => setConfirmBulkApprove(true)}
            className="rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Duyệt tất cả
          </button>
        ) : null}
      </div>

      {jobs.length === 0 ? (
        <div className="py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Không có tin cần duyệt
        </div>
      ) : (
        <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
          {jobs.map((job, idx) => (
            <motion.li
              key={job.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.015 }}
              className={cn(
                adminModerationListItem,
                "flex flex-wrap items-center justify-between gap-3",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900 dark:text-white">
                  {job.title}
                </p>
                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                  {job.company?.name ?? "—"} · {job.category?.name ?? "—"} ·{" "}
                  {formatDate(job.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={adminModerationBtnGhost}
                  onClick={() => openModal("view-job", { job })}
                >
                  Xem
                </button>
                {canApprove ? (
                  <button
                    type="button"
                    className={adminModerationBtnApprove}
                    onClick={() => void approveOne(job.id)}
                  >
                    Duyệt
                  </button>
                ) : null}
                {canReject ? (
                  <button
                    type="button"
                    className={adminModerationBtnReject}
                    onClick={() => void rejectOne(job.id)}
                  >
                    Từ chối
                  </button>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
