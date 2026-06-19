"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { adminAccessControlService } from "@/services/admin-access-control.service";
import type {
  AccessControlRoleDetail,
  AccessControlRoleListItem,
} from "@/app/types/access-control.type";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import AdminPagination from "@/components/admin/AdminPagination";
import RoleFormModal from "./RoleFormModal";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_NATIVE_OPTION,
  ADMIN_NATIVE_SELECT,
  adminSearchFieldWithIcon,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableEmptyCell,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import { STALE_ADMIN_ACCESS_CONTROL_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";

type Tab = "roles" | "permissions";

const TABS: { id: Tab; label: string }[] = [
  { id: "roles", label: "Vai trò" },
  { id: "permissions", label: "Quyền hạn" },
];

export default function AccessControlPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const tab = (searchParams.get("tab") as Tab) || "roles";
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  const [modal, setModal] = useState<
    | { kind: "create" }
    | { kind: "edit"; roleId: number }
    | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    AccessControlRoleListItem | null
  >(null);

  const permsQuery = useQuery({
    queryKey: ["admin", "access-control", "permissions"],
    queryFn: () => adminAccessControlService.listPermissions(),
    staleTime: STALE_ADMIN_ACCESS_CONTROL_MS,
  });

  const rolesParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "20");
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    return p;
  }, [page, search, statusFilter]);

  const rolesQuery = useQuery({
    queryKey: ["admin", "access-control", "roles", rolesParams.toString()],
    queryFn: () => adminAccessControlService.listRoles(rolesParams),
    staleTime: STALE_ADMIN_ACCESS_CONTROL_MS,
  });

  const editRoleQuery = useQuery<AccessControlRoleDetail>({
    queryKey: [
      "admin",
      "access-control",
      "role",
      modal?.kind === "edit" ? modal.roleId : null,
    ],
    queryFn: () =>
      adminAccessControlService.getRole((modal as { roleId: number }).roleId),
    enabled: modal?.kind === "edit",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminAccessControlService.deleteRole(id),
    onSuccess: () => {
      toast.success("Đã xóa vai trò");
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["admin", "access-control", "roles"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorToastMessage(err) || "Không xóa được vai trò");
    },
  });

  const pushQuery = (next: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === "") p.delete(k);
      else p.set(k, v);
    });
    router.replace(`?${p.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Phân quyền
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">
          Quản lý vai trò và quyền hạn của hệ thống. Cập nhật vai trò sẽ tự động
          làm mới cache quyền của các tài khoản liên quan.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pushQuery({ tab: t.id, page: "" })}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition",
              tab === t.id
                ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-200"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "roles" ? (
        <RolesPanel
          search={search}
          statusFilter={statusFilter}
          onSearch={(v) => pushQuery({ search: v, page: "1" })}
          onStatusChange={(v) => pushQuery({ status: v, page: "1" })}
          onPageChange={(p) => pushQuery({ page: String(p) })}
          onCreate={() => setModal({ kind: "create" })}
          onEdit={(id) => setModal({ kind: "edit", roleId: id })}
          onDelete={(role) => setDeleteTarget(role)}
          data={rolesQuery.data}
          isLoading={rolesQuery.isLoading}
          isError={rolesQuery.isError}
          onRetry={() => rolesQuery.refetch()}
        />
      ) : (
        <PermissionsPanel
          modules={permsQuery.data?.modules ?? []}
          total={permsQuery.data?.total ?? 0}
          isLoading={permsQuery.isLoading}
          isError={permsQuery.isError}
          onRetry={() => permsQuery.refetch()}
        />
      )}

      {modal?.kind === "create" && permsQuery.data ? (
        <RoleFormModal
          mode={{ kind: "create" }}
          modules={permsQuery.data.modules}
          onClose={() => setModal(null)}
        />
      ) : null}

      {modal?.kind === "edit" && permsQuery.data && editRoleQuery.data ? (
        <RoleFormModal
          mode={{ kind: "edit", role: editRoleQuery.data }}
          modules={permsQuery.data.modules}
          onClose={() => setModal(null)}
        />
      ) : null}

      <AdminConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Xóa vai trò?"
        description={
          deleteTarget
            ? `Vai trò "${deleteTarget.name}" sẽ bị xóa vĩnh viễn. Thao tác không hoàn tác.`
            : ""
        }
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

function RolesPanel({
  search,
  statusFilter,
  onSearch,
  onStatusChange,
  onPageChange,
  onCreate,
  onEdit,
  onDelete,
  data,
  isLoading,
  isError,
  onRetry,
}: {
  search: string;
  statusFilter: string;
  onSearch: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  onEdit: (id: number) => void;
  onDelete: (role: AccessControlRoleListItem) => void;
  data:
    | Awaited<ReturnType<typeof adminAccessControlService.listRoles>>
    | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          adminSurfaceCardBlur,
          "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
        )}
      >
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            defaultValue={search}
            placeholder="Tìm theo tên vai trò..."
            className={adminSearchFieldWithIcon}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className={ADMIN_NATIVE_SELECT}
        >
          <option value="" className={ADMIN_NATIVE_OPTION}>
            Tất cả trạng thái
          </option>
          <option value="true" className={ADMIN_NATIVE_OPTION}>
            Đang hoạt động
          </option>
          <option value="false" className={ADMIN_NATIVE_OPTION}>
            Đã tắt
          </option>
        </select>
        <button
          type="button"
          onClick={onCreate}
          className={ADMIN_ADD_NEW_BUTTON}
        >
          <Plus className="h-4 w-4" />
          Vai trò mới
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
      ) : isError || !data ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
          <p>Không tải được danh sách vai trò.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-sm text-amber-800 underline dark:text-amber-200"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(adminSurfaceCardBlur, "overflow-hidden p-0 shadow-xl")}
        >
          <table className={cn("min-w-full text-sm", adminTableDivide)}>
            <thead>
              <tr className={cn(adminTableHeadRow, "uppercase tracking-wide")}>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Quyền</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className={adminTableDivide}>
              {data.roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className={adminTableEmptyCell}>
                    Không có vai trò.
                  </td>
                </tr>
              ) : (
                data.roles.map((r) => (
                  <tr
                    key={r.id}
                    className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {r.name}
                        </span>
                        {r.isProtected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                            <Lock className="h-3 w-3" />
                            Hệ thống
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                      {r.permissionCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {r.userCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          r.status
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
                        )}
                      >
                        {r.status ? "Hoạt động" : "Đã tắt"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                          onClick={() => onEdit(r.id)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={r.isProtected || r.userCount > 0}
                          className="rounded-lg border border-zinc-200 p-2 text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-500/10"
                          onClick={() => onDelete(r)}
                          title={
                            r.isProtected
                              ? "Vai trò hệ thống — không thể xóa"
                              : r.userCount > 0
                                ? "Có người dùng đang gán vai trò"
                                : "Xóa"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <AdminPagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={onPageChange}
          />
        </motion.div>
      )}
    </>
  );
}

function PermissionsPanel({
  modules,
  total,
  isLoading,
  isError,
  onRetry,
}: {
  modules: Awaited<
    ReturnType<typeof adminAccessControlService.listPermissions>
  >["modules"];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return modules;
    return modules
      .map((m) => ({
        ...m,
        permissions: m.permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.actionName.toLowerCase().includes(q) ||
            m.moduleName.toLowerCase().includes(q),
        ),
      }))
      .filter((m) => m.permissions.length > 0);
  }, [modules, search]);

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
        <p>Không tải được danh sách quyền.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm text-amber-800 underline dark:text-amber-200"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          adminSurfaceCardBlur,
          "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
        )}
      >
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên quyền, module hoặc action..."
            className={adminSearchFieldWithIcon}
          />
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Tổng cộng {total} quyền
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-zinc-200 bg-white px-5 py-10 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
            Không có quyền nào khớp tìm kiếm.
          </div>
        ) : (
          filtered.map((bucket) => (
            <motion.div
              key={bucket.moduleId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                adminSurfaceCardBlur,
                "flex flex-col p-4",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {bucket.moduleName}
                  {!bucket.moduleStatus ? (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      TẮT
                    </span>
                  ) : null}
                </h3>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {bucket.permissions.length} quyền
                </span>
              </div>
              <ul className="space-y-1.5">
                {bucket.permissions.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/[0.02]"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium text-zinc-800 dark:text-zinc-100">
                        {p.actionName}
                      </span>
                      <span className="truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                        {p.name}
                      </span>
                    </div>
                    {!p.actionStatus ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        TẮT
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}
