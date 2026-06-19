"use client";

import type { AuditLogListResponse } from "@/app/types/audit-log.type";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn } from "@/lib/utils";
import {
  ADMIN_FILTER_FIELD,
  ADMIN_FILTER_GRID,
  ADMIN_FILTER_LABEL,
  ADMIN_FILTER_SELECT_WIDE,
  ADMIN_NATIVE_OPTION,
  adminSearchField,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default function AuditLogsTable({
  data,
}: {
  data: AuditLogListResponse;
}) {
  const { logs, pagination } = data;
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Nhật ký kiểm toán
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Theo dõi thao tác quản trị và thay đổi quan trọng trong hệ thống.
          </p>
        </div>
      </div>

      <div className={ADMIN_FILTER_GRID}>
        <div className={ADMIN_FILTER_FIELD}>
          <span className={ADMIN_FILTER_LABEL}>Action</span>
          <input
            defaultValue={searchParams.get("action") || ""}
            onChange={(e) => setParam("action", e.target.value)}
            placeholder="admin:jobs:update..."
            className={cn("w-full", adminSearchField)}
          />
        </div>

        <div className={ADMIN_FILTER_FIELD}>
          <span className={ADMIN_FILTER_LABEL}>Actor userId</span>
          <input
            defaultValue={searchParams.get("actorUserId") || ""}
            onChange={(e) => setParam("actorUserId", e.target.value)}
            placeholder="123"
            inputMode="numeric"
            className={cn("w-full", adminSearchField)}
          />
        </div>

        <div className={ADMIN_FILTER_FIELD}>
          <span className={ADMIN_FILTER_LABEL}>Entity type</span>
          <input
            defaultValue={searchParams.get("entityType") || ""}
            onChange={(e) => setParam("entityType", e.target.value)}
            placeholder="Job / Company / User..."
            className={cn("w-full", adminSearchField)}
          />
        </div>

        <div className={ADMIN_FILTER_FIELD}>
          <span className={ADMIN_FILTER_LABEL}>Entity id</span>
          <input
            defaultValue={searchParams.get("entityId") || ""}
            onChange={(e) => setParam("entityId", e.target.value)}
            placeholder="1"
            className={cn("w-full", adminSearchField)}
          />
        </div>

        <div className={ADMIN_FILTER_FIELD}>
          <span className={ADMIN_FILTER_LABEL}>Success</span>
          <select
            defaultValue={searchParams.get("success") || ""}
            onChange={(e) => setParam("success", e.target.value)}
            className={ADMIN_FILTER_SELECT_WIDE}
          >
            <option className={ADMIN_NATIVE_OPTION} value="">
              Tất cả
            </option>
            <option className={ADMIN_NATIVE_OPTION} value="true">
              Thành công
            </option>
            <option className={ADMIN_NATIVE_OPTION} value="false">
              Thất bại
            </option>
          </select>
        </div>
      </div>

      <div className={cn(adminSurfaceCardBlur, "mt-6 overflow-hidden p-0")}>
        <div className="overflow-x-auto">
          <table className={cn("min-w-full text-sm", adminTableDivide)}>
            <thead>
              <tr
                className={cn(
                  adminTableHeadRow,
                  "uppercase tracking-wide",
                )}
              >
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">KQ</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className={adminTableDivide}>
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-sm">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {log.actorUser?.username || `#${log.actorUserId}`}
                      </span>
                      {log.actorUser?.email ? (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {log.actorUser.email}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/audit-logs/${log.id}`}
                      className="font-mono text-xs text-violet-700 hover:text-violet-600 dark:text-violet-200 dark:hover:text-violet-100"
                    >
                      {log.action}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-xs text-zinc-600 dark:text-zinc-300">
                      {log.entityType || "—"}
                      {log.entityId ? `#${log.entityId}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                        log.success
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20"
                          : "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/20"
                      }`}
                    >
                      {log.success ? "OK" : "FAIL"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {log.ip || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
