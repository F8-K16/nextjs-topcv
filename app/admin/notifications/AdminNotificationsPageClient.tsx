"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { useAuthStore } from "@/app/stores/auth.store";
import {
  STALE_NOTIFICATIONS_PAGE_MS,
  STALE_NOTIFICATIONS_UNREAD_MS,
} from "@/lib/query-stale-time";
import {
  notificationService,
  type AppNotification,
} from "@/services/notification.service";
import { cn } from "@/lib/utils";

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

export default function AdminNotificationsPageClient() {
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.id;
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notifications", "admin", userId, page],
    queryFn: () => notificationService.list({ page, limit: 20 }),
    enabled: isAuthenticated && userId != null,
    staleTime: STALE_NOTIFICATIONS_PAGE_MS,
  });

  const { data: unreadTotal = 0 } = useQuery({
    queryKey: ["notifications-unread", userId],
    queryFn: () => notificationService.unreadCount(),
    enabled: isAuthenticated && userId != null,
    staleTime: STALE_NOTIFICATIONS_UNREAD_MS,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-400">
        Đăng nhập để xem thông báo quản trị.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-[#00b14f] dark:text-emerald-400" />
        <span className="text-sm">Đang tải thông báo…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
        {error instanceof Error ? error.message : "Không tải được thông báo."}
      </div>
    );
  }

  const items = data?.notifications ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Thông báo quản trị
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Tin chờ duyệt và hoạt động trên hệ thống
            </p>
          </div>
        </div>
        {unreadTotal > 0 ? (
          <button
            type="button"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {markAllMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Đánh dấu đã đọc tất cả
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400">
          Chưa có thông báo.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <AdminNotificationRow
              key={n.id}
              n={n}
              onMarkRead={() => markReadMutation.mutate(n.id)}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && pagination ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-6 dark:border-white/10"
          aria-label="Phân trang thông báo"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Trước
          </button>
          <span className="px-2 text-sm text-zinc-600 dark:text-zinc-400">
            Trang {pagination.page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Sau
          </button>
        </nav>
      ) : null}
    </div>
  );
}

function AdminNotificationRow({
  n,
  onMarkRead,
}: {
  n: AppNotification;
  onMarkRead: () => void;
}) {
  const unread = !n.readAt;
  const time = formatViDateTime(n.createdAt);

  return (
    <li>
      <Link
        href={`/admin/notifications/${n.id}`}
        onClick={() => {
          if (unread) onMarkRead();
        }}
        className={cn(
          "block rounded-xl border outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          "border-zinc-200 bg-white shadow-sm hover:border-emerald-300/60 hover:bg-zinc-50",
          "dark:border-white/10 dark:bg-zinc-900/50 dark:hover:border-emerald-500/30 dark:hover:bg-zinc-800/50",
        )}
      >
        <div className="flex gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {n.title}
            </p>
            {n.body ? (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                {n.body}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
              {time}
            </p>
          </div>
          {unread ? (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          ) : null}
        </div>
      </Link>
    </li>
  );
}
