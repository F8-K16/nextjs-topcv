import { fetchWrapper } from "@/utils/fetch";
import type { AuditLog } from "@/app/types/audit-log.type";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-base-url";
import { cn } from "@/lib/utils";
import { adminSurfaceCardBlur } from "@/lib/admin-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết nhật ký",
  description: "Chi tiết một bản ghi nhật ký quản trị.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AuditLogDetailPage({ params }: Props) {
  const { id } = await params;

  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/audit-logs/${id}`,
  );
  if (!res.ok) {
    return (
      <div className={cn(adminSurfaceCardBlur, "p-6")}>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          Không tải được log #{id}
        </div>
        <Link
          href="/admin/audit-logs"
          className="mt-3 inline-flex text-sm font-medium text-violet-700 hover:text-violet-600 dark:text-violet-200 dark:hover:text-violet-100"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  const json = (await res.json()) as { data: AuditLog };
  const log = json.data;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={`Audit log #${log.id}`}
        description={log.action}
        actions={
          <Link
            href="/admin/audit-logs"
            className="inline-flex h-9 items-center rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Quay lại
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className={cn(adminSurfaceCardBlur, "p-4")}>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Actor
          </div>
          <div className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
            {log.actorUser?.username || `#${log.actorUserId}`}
          </div>
          {log.actorUser?.email ? (
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {log.actorUser.email}
            </div>
          ) : null}
        </div>

        <div className={cn(adminSurfaceCardBlur, "p-4")}>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Context
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-zinc-500">Success</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">{String(log.success)}</dd>
            <dt className="text-zinc-500">Entity</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">
              {(log.entityType || "—") + (log.entityId ? `#${log.entityId}` : "")}
            </dd>
            <dt className="text-zinc-500">IP</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">{log.ip || "—"}</dd>
            <dt className="text-zinc-500">Request ID</dt>
            <dd className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
              {log.requestId || "—"}
            </dd>
          </dl>
        </div>
      </div>

      <div className={cn(adminSurfaceCardBlur, "p-4")}>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Metadata
        </div>
        <pre className="mt-3 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200">
          {JSON.stringify(log.metadata ?? null, null, 2)}
        </pre>
      </div>
    </div>
  );
}

