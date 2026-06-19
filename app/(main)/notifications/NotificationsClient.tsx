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

export default function NotificationsClient() {
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.id;
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notifications", userId, page],
    queryFn: () => notificationService.list({ page, limit: 20 }),
    enabled: isAuthenticated && !!userId,
    staleTime: STALE_NOTIFICATIONS_PAGE_MS,
  });

  const { data: unreadTotal = 0 } = useQuery({
    queryKey: ["notifications-unread", userId],
    queryFn: () => notificationService.unreadCount(),
    enabled: isAuthenticated && !!userId,
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-gray-600">
          Đăng nhập để xem thông báo của bạn.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-block text-sm font-semibold text-[#00b14f] hover:underline"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#00b14f]" />
        <span className="text-sm">Đang tải thông báo…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
        {error instanceof Error ? error.message : "Không tải được thông báo."}
      </div>
    );
  }

  const items = data?.notifications ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00b14f]/10 text-[#00b14f]">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-xs text-gray-500">
              Đơn ứng tuyển, duyệt tin và cập nhật từ hệ thống
            </p>
          </div>
        </div>
        {unreadTotal > 0 ? (
          <button
            type="button"
            disabled={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
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
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-14 text-center text-sm text-zinc-600">
          Chưa có thông báo nào.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              n={n}
              onMarkRead={() => markReadMutation.mutate(n.id)}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && pagination ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-6"
          aria-label="Phân trang thông báo"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trước
          </button>
          <span className="px-2 text-sm text-zinc-600">
            Trang {pagination.page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau
          </button>
        </nav>
      ) : null}

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link
          href="/applied-jobs"
          className="font-semibold text-[#00b14f] hover:underline"
        >
          Xem việc đã ứng tuyển
        </Link>
      </p>
    </div>
  );
}

function NotificationRow({
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
        href={`/notifications/${n.id}`}
        onClick={() => {
          if (unread) onMarkRead();
        }}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#00b14f]/40"
      >
        <div
          className={`flex gap-3 border px-4 py-3 transition ${
            unread
              ? "border-[#00b14f]/25 bg-[#00b14f]/5"
              : "border-zinc-100 bg-white hover:bg-zinc-50/80"
          }`}
        >
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
            {n.body ? (
              <p className="mt-1 text-xs text-zinc-600 line-clamp-2">{n.body}</p>
            ) : null}
            <p className="mt-2 text-[11px] text-zinc-400">{time}</p>
          </div>
          {unread ? (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00b14f]" />
          ) : null}
        </div>
      </Link>
    </li>
  );
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
