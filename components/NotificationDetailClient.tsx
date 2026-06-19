"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { STALE_NOTIFICATION_DETAIL_MS } from "@/lib/query-stale-time";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/app/stores/auth.store";

function relatedAction(
  type: string,
  variant: "main" | "admin",
): { href: string; label: string } | null {
  if (variant === "admin") {
    if (type === "JOB_PENDING_REVIEW") {
      return { href: "/admin/moderation", label: "Duyệt tin tuyển dụng" };
    }
    if (type === "EMPLOYER_REGISTRATION_PENDING") {
      return { href: "/admin/moderation", label: "Duyệt tài khoản" };
    }
    return null;
  }
  switch (type) {
    case "APPLICATION_STATUS":
      return { href: "/applied-jobs", label: "Việc đã ứng tuyển" };
    case "APPLICATION_NEW":
      return { href: "/employer/applications", label: "Quản lý ứng viên" };
    case "JOB_APPROVED":
      return { href: "/employer/jobs", label: "Tin tuyển dụng của bạn" };
    case "COMPANY_NEW_JOB":
      return { href: "/jobs", label: "Xem việc làm" };
    case "JOB_DEADLINE_WITHIN_24H":
      return { href: "/employer/jobs", label: "Quản lý tin tuyển dụng" };
    default:
      return null;
  }
}

function formatViDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  id: number;
  variant: "main" | "admin";
};

export default function NotificationDetailClient({ id, variant }: Props) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const listPath =
    variant === "admin" ? "/admin/notifications" : "/notifications";

  const detailKey =
    variant === "admin"
      ? (["notification", "admin", id] as const)
      : (["notification", userId, id] as const);

  const {
    data: n,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: detailKey,
    queryFn: () => notificationService.getById(id),
    enabled:
      Number.isFinite(id) && id > 0 && (variant === "admin" || userId != null),
    staleTime: STALE_NOTIFICATION_DETAIL_MS,
  });

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    void notificationService
      .markRead(id)
      .then(() => {
        void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
        void qc.invalidateQueries({ queryKey: ["notifications-preview"] });
        void qc.invalidateQueries({ queryKey: ["notifications"] });
      })
      .catch(() => {});
  }, [id, qc]);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <p className="text-red-700 dark:text-red-300">ID không hợp lệ.</p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#00b14f] dark:text-emerald-400" />
        <span className="text-zinc-600 dark:text-zinc-400">Đang tải…</span>
      </div>
    );
  }

  if (isError || !n) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
        {error instanceof Error ? error.message : "Không tìm thấy thông báo."}
      </div>
    );
  }

  const action = relatedAction(n.type, variant);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={listPath}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-[#00b14f] dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      <article className="min-w-0 rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-zinc-900 shadow-sm dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#00b14f] dark:text-emerald-400/90">
          {n.type.replace(/_/g, " ")}
        </p>
        <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
          {n.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {formatViDateTime(n.createdAt)}
          {n.readAt ? (
            <span className="ml-2 opacity-80">· Đã đọc</span>
          ) : (
            <span className="ml-2 opacity-80">· Chưa đọc</span>
          )}
        </p>
        {n.body ? (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {n.body}
          </p>
        ) : null}

        {action ? (
          <div className="mt-8 border-t border-dashed border-zinc-200 pt-6 dark:border-white/10">
            <Link
              href={action.href}
              className="inline-flex rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#009944] dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {action.label}
            </Link>
          </div>
        ) : null}
      </article>
    </div>
  );
}
