"use client";

import { motion } from "framer-motion";
import { PendingEmployer } from "@/app/types/user.type";
import { employerService } from "@/services/employer.service";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/helper";
import { toast } from "sonner";
import { useState } from "react";
import { useAuthStore } from "@/app/stores/auth.store";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  adminDialogSurface,
  adminModerationBtnApprove,
  adminModerationBtnReject,
  adminModerationCountChip,
  adminModerationHeading,
  adminModerationPanel,
  adminModerationTableShell,
  adminModerationTh,
  adminModerationThead,
  adminModerationTr,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

type Props = {
  data: PendingEmployer[];
};

export default function PendingEmployersTable({ data }: Props) {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const canApprove = permissions.includes("admin:moderation:approve");
  const canReject = permissions.includes("admin:moderation:reject");
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    employerId: number | null;
  }>({
    open: false,
    employerId: null,
  });

  const [reason, setReason] = useState("");
  const [bulkApproving, setBulkApproving] = useState(false);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const router = useRouter();

  const handleApprove = async (id: number) => {
    await employerService.approve(id);
    toast.success("Duyệt thành công");
    router.refresh();
  };

  const handleReject = async (id: number) => {
    setRejectModal({ open: true, employerId: id });
  };

  const submitReject = async () => {
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    await employerService.reject(rejectModal.employerId!, reason);

    toast.success("Từ chối thành công");
    setRejectModal({ open: false, employerId: null });
    setReason("");
    router.refresh();
  };

  const runBulkApprove = async () => {
    if (data.length === 0) return;
    setBulkApproving(true);
    try {
      const r = await employerService.approveAllPending();
      toast.success(
        r.approved === r.totalPending
          ? `Đã duyệt ${r.approved} tài khoản`
          : `Đã duyệt ${r.approved}/${r.totalPending} tài khoản (một số bản ghi có thể lỗi)`,
      );
      setConfirmBulkOpen(false);
      router.refresh();
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Không duyệt hàng loạt được",
      );
    } finally {
      setBulkApproving(false);
    }
  };

  return (
    <div id="moderation-employers" className={adminModerationPanel}>
      <AdminConfirmDialog
        open={confirmBulkOpen}
        onOpenChange={(o) => !o && setConfirmBulkOpen(false)}
        title="Duyệt tất cả nhà tuyển dụng đang chờ?"
        description={`Hệ thống sẽ duyệt ${data.length} hồ sơ đang hiển thị và gửi email thông báo cho từng người.`}
        confirmLabel="Duyệt tất cả"
        variant="default"
        loading={bulkApproving}
        onConfirm={runBulkApprove}
      />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className={adminModerationHeading}>
          Nhà tuyển dụng chờ duyệt
          <span className={adminModerationCountChip}>{data.length}</span>
        </h3>
        {data.length > 0 && canApprove ? (
          <button
            type="button"
            disabled={bulkApproving}
            onClick={() => setConfirmBulkOpen(true)}
            className="rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {bulkApproving ? "Đang duyệt…" : "Duyệt tất cả"}
          </button>
        ) : null}
      </div>

      <div className={adminModerationTableShell}>
        <div className="max-h-[min(28rem,70vh)] overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead className={adminModerationThead}>
              <tr>
                <th className={adminModerationTh}>Họ và tên</th>
                <th className={adminModerationTh}>Email</th>
                <th className={adminModerationTh}>Công ty</th>
                <th className={cn(adminModerationTh, "min-w-[200px]")}>
                  Địa chỉ
                </th>
                <th className={adminModerationTh}>Đăng ký</th>
                <th className={cn(adminModerationTh, "text-right")}>
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    Không có nhà tuyển dụng cần duyệt
                  </td>
                </tr>
              )}

              {data.map((e, index) => (
                <motion.tr
                  key={e.employerId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={adminModerationTr}
                >
                  <td className="max-w-[160px] px-4 py-3 align-top font-medium text-zinc-900 dark:text-white">
                    <span className="line-clamp-2 break-words">{e.username}</span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 align-top text-zinc-700 dark:text-zinc-300">
                    <span className="line-clamp-2 break-all">{e.email}</span>
                  </td>

                  <td className="max-w-[180px] px-4 py-3 align-top text-zinc-700 dark:text-zinc-300">
                    {e.company?.name ? (
                      <span className="line-clamp-2 break-words">
                        {e.company.name}
                      </span>
                    ) : (
                      <span className="italic text-zinc-500 dark:text-zinc-500">
                        Chưa có công ty
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 align-top text-zinc-700 dark:text-zinc-300">
                    <div className="max-w-[320px] text-sm">
                      <p className="line-clamp-2 break-words text-zinc-800 dark:text-zinc-200">
                        {e.company?.location || "Chưa có địa chỉ"}
                      </p>
                      {(e.company?.district || e.company?.province) && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-500">
                          {[e.company?.district?.name, e.company?.province?.name]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-600 dark:text-zinc-400">
                    {formatDate(e.createdAt)}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap justify-end gap-2">
                      {canApprove ? (
                        <button
                          type="button"
                          onClick={() => void handleApprove(e.employerId)}
                          className={adminModerationBtnApprove}
                        >
                          Duyệt
                        </button>
                      ) : null}

                      {canReject ? (
                        <button
                          type="button"
                          onClick={() => void handleReject(e.employerId)}
                          className={adminModerationBtnReject}
                        >
                          Từ chối
                        </button>
                      ) : null}

                      {!canApprove && !canReject ? (
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">
                          Không có quyền
                        </span>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={rejectModal.open && canReject}
        onOpenChange={(open) => {
          if (!open) {
            setRejectModal({ open: false, employerId: null });
            setReason("");
          }
        }}
      >
        <DialogContent
          className={cn(
            "sm:max-w-md shadow-2xl backdrop-blur-xl",
            adminDialogSurface,
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg text-zinc-900 dark:text-white">
              Lý do từ chối
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              Nội dung sẽ được gửi kèm thông báo cho nhà tuyển dụng.
            </DialogDescription>
          </DialogHeader>

          <label
            htmlFor="reject-reason-employer"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nội dung lý do
          </label>
          <textarea
            id="reject-reason-employer"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            className="h-28 w-full resize-none rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-zinc-500 dark:focus-visible:ring-rose-500/50"
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-200 bg-transparent text-zinc-800 hover:bg-zinc-100 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
              onClick={() => {
                setRejectModal({ open: false, employerId: null });
                setReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void submitReject()}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
