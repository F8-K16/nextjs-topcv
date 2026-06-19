"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useFixedDropdownPlacement } from "@/hooks/use-fixed-dropdown-placement";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useHeaderDropdownStore } from "@/app/stores/header-dropdown.store";
import { useAuthStore } from "@/app/stores/auth.store";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import { invalidateNotificationQueries } from "@/lib/invalidate-notification-queries";
import {
  STALE_NOTIFICATIONS_PREVIEW_MS,
  STALE_NOTIFICATIONS_UNREAD_MS,
} from "@/lib/query-stale-time";
import { notificationService } from "@/services/notification.service";

type Props = {
  variant: "main" | "admin";
  className?: string;
  iconClassName?: string;
};

export default function NotificationBellDropdown({
  variant,
  className = "relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-[#00b14f]",
  iconClassName = "h-[22px] w-[22px]",
}: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.id;
  const [localOpen, setLocalOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const openId = useHeaderDropdownStore((s) => s.openId);
  const toggle = useHeaderDropdownStore((s) => s.toggle);
  const close = useHeaderDropdownStore((s) => s.close);

  const useShared = variant === "main";
  const open = useShared ? openId === "notifications" : localOpen;

  const closePanel = useCallback(() => {
    if (useShared) close();
    else setLocalOpen(false);
  }, [useShared, close]);

  const togglePanel = useCallback(() => {
    if (useShared) toggle("notifications");
    else setLocalOpen((o) => !o);
  }, [useShared, toggle]);

  const basePath =
    variant === "admin" ? "/admin/notifications" : "/notifications";

  useEffect(() => {
    if (useShared || !open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setLocalOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, useShared]);

  const { data: count = 0 } = useQuery({
    queryKey: ["notifications-unread", userId],
    queryFn: () => notificationService.unreadCount(),
    enabled: isAuthenticated && !!userId,
    staleTime: STALE_NOTIFICATIONS_UNREAD_MS,
    refetchInterval: 180_000,
  });

  const { data: preview, isFetching } = useQuery({
    queryKey: ["notifications-preview", userId],
    queryFn: () => notificationService.list({ page: 1, limit: 8 }),
    enabled: isAuthenticated && !!userId && open,
    staleTime: STALE_NOTIFICATIONS_PREVIEW_MS,
  });

  const invalidateNotifications = useCallback(() => {
    invalidateNotificationQueries(qc);
  }, [qc]);

  useNotificationRealtime(Boolean(isAuthenticated));

  const goToDetail = useCallback(
    (id: number) => {
      void notificationService
        .markRead(id)
        .then(() => invalidateNotifications())
        .catch(() => {});
      router.push(`${basePath}/${id}`);
      closePanel();
    },
    [basePath, closePanel, invalidateNotifications, router],
  );

  const panelMaxWidthPx = 352;
  const panelStyle = useFixedDropdownPlacement(
    isAuthenticated && open,
    buttonRef,
    panelMaxWidthPx,
  );

  if (!isAuthenticated) return null;

  const items = preview?.notifications ?? [];
  const isAdminPanel = variant === "admin";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        title="Thông báo"
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          togglePanel();
        }}
      >
        <Bell className={iconClassName} strokeWidth={1.75} />
        {count > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          style={panelStyle}
          className={`flex min-h-0 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl border shadow-xl ${
            isAdminPanel
              ? "border-zinc-200 bg-white text-zinc-900 shadow-zinc-900/10 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-black/40"
              : "border-zinc-200 bg-white text-zinc-900 shadow-zinc-200/50"
          }`}
        >
          <div
            className={`flex shrink-0 items-center justify-between border-b px-3 py-2 text-xs font-semibold ${
              isAdminPanel
                ? "border-zinc-100 text-zinc-600 dark:border-white/10 dark:text-zinc-300"
                : "border-zinc-100 text-zinc-600"
            }`}
          >
            <span>Thông báo</span>
            <Link
              href={basePath}
              className={
                isAdminPanel
                  ? "text-[#00b14f] hover:underline dark:text-emerald-400"
                  : "text-[#00b14f] hover:underline"
              }
              onClick={() => closePanel()}
            >
              Xem tất cả
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isFetching && !items.length ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm opacity-70">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải…
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm opacity-70">
                Chưa có thông báo
              </p>
            ) : (
              <ul
                className={`divide-y ${isAdminPanel ? "divide-zinc-100 dark:divide-white/10" : "divide-zinc-100"}`}
              >
                {items.map((n) => {
                  const unread = !n.readAt;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => goToDetail(n.id)}
                        className={`flex w-full gap-2 px-3 py-2.5 text-left text-sm transition ${
                          isAdminPanel
                            ? unread
                              ? "bg-[#00b14f]/5 hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/10"
                              : "hover:bg-zinc-50 dark:hover:bg-white/5"
                            : unread
                              ? "bg-[#00b14f]/5 hover:bg-[#00b14f]/10"
                              : "hover:bg-zinc-50"
                        }`}
                      >
                        {unread ? (
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              isAdminPanel
                                ? "bg-[#00b14f] dark:bg-emerald-400"
                                : "bg-[#00b14f]"
                            }`}
                          />
                        ) : (
                          <span className="mt-1.5 h-2 w-2 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 font-medium leading-snug">
                            {n.title}
                          </span>
                          {n.body ? (
                            <span
                              className={`mt-0.5 line-clamp-2 text-xs ${
                                isAdminPanel
                                  ? "text-zinc-500 dark:text-zinc-400"
                                  : "text-zinc-500"
                              }`}
                            >
                              {n.body}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
