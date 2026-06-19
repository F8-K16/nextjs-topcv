"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Loader2, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminAccessControlService } from "@/services/admin-access-control.service";
import type {
  AccessControlModuleBucket,
  AccessControlRoleDetail,
} from "@/app/types/access-control.type";
import { cn } from "@/lib/utils";
import {
  adminDialogSurface,
  adminInput,
  adminLabel,
} from "@/lib/admin-ui";
import { getErrorToastMessage, resolveSubmitError } from "@/lib/submit-error";

type Mode =
  | { kind: "create" }
  | { kind: "edit"; role: AccessControlRoleDetail };

export default function RoleFormModal({
  mode,
  modules,
  onClose,
}: {
  mode: Mode;
  modules: AccessControlModuleBucket[];
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const initialRole = mode.kind === "edit" ? mode.role : null;
  const isProtected = initialRole?.isProtected ?? false;

  const [name, setName] = useState(initialRole?.name ?? "");
  const [status, setStatus] = useState<boolean>(initialRole?.status ?? true);
  const [permissionIds, setPermissionIds] = useState<number[]>(
    () => initialRole?.permissionIds ?? [],
  );
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedSet = useMemo(
    () => new Set(permissionIds),
    [permissionIds],
  );

  const filteredModules = useMemo(() => {
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

  const totalSelected = permissionIds.length;

  const togglePermission = useCallback((id: number) => {
    setPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleModule = useCallback((bucket: AccessControlModuleBucket) => {
    const ids = bucket.permissions.map((p) => p.id);
    setPermissionIds((prev) => {
      const prevSet = new Set(prev);
      const allSelected = ids.every((id) => prevSet.has(id));
      if (allSelected) {
        const remove = new Set(ids);
        return prev.filter((id) => !remove.has(id));
      }
      const next = [...prev];
      for (const id of ids) {
        if (!prevSet.has(id)) next.push(id);
      }
      return next;
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim().toUpperCase(),
        status,
        permissionIds,
      };
      if (mode.kind === "create") {
        return adminAccessControlService.createRole(payload);
      }
      return adminAccessControlService.updateRole(mode.role.id, payload);
    },
    onSuccess: () => {
      toast.success(
        mode.kind === "create" ? "Đã tạo vai trò" : "Đã cập nhật vai trò",
      );
      qc.invalidateQueries({ queryKey: ["admin", "access-control"] });
      onClose();
    },
    onError: (err: unknown) => {
      const { toastMessage, fieldErrors: fe } = resolveSubmitError(err);
      setFieldErrors(fe);
      toast.error(toastMessage || getErrorToastMessage(err));
    },
  });

  const handleSubmit = () => {
    setFieldErrors({});
    if (!name.trim()) {
      setFieldErrors({ name: "Tên vai trò là bắt buộc" });
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] w-[min(48rem,calc(100%-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none",
          adminDialogSurface,
          "border",
        )}
        onPointerDownOutside={(e) => {
          if (mutation.isPending) e.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b border-zinc-200 px-5 py-4 dark:border-white/10">
          <DialogTitle className="text-zinc-900 dark:text-white">
            {mode.kind === "create" ? "Tạo vai trò" : "Sửa vai trò"}
          </DialogTitle>
          {mode.kind === "edit" ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {mode.role.userCount} người dùng đang được gán vai trò này
              {isProtected ? " · Vai trò hệ thống" : ""}
            </p>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={adminLabel}>Tên vai trò</label>
              <input
                className={cn(
                  adminInput,
                  fieldErrors.name &&
                    "border-rose-400 focus:ring-rose-400/30",
                )}
                placeholder="VD: CONTENT_EDITOR"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                disabled={isProtected}
                autoFocus={mode.kind === "create"}
              />
              {fieldErrors.name ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {fieldErrors.name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Chữ HOA, số và dấu gạch dưới.
                  {isProtected ? " Không đổi tên vai trò hệ thống." : ""}
                </p>
              )}
            </div>

            <div>
              <label className={adminLabel}>Trạng thái</label>
              <button
                type="button"
                onClick={() => setStatus((s) => !s)}
                className={cn(
                  "flex h-[42px] w-full items-center gap-3 rounded-lg border px-3 text-left text-sm transition",
                  status
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                    : "border-zinc-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-[#2f2f2f] dark:text-zinc-200",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    status
                      ? "border-emerald-500 bg-emerald-600 text-white"
                      : "border-zinc-300 bg-white dark:border-white/20 dark:bg-transparent",
                  )}
                >
                  {status ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <span>{status ? "Đang hoạt động" : "Đã tắt"}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className={adminLabel}>
                Quyền hạn
                <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                  Đã chọn {totalSelected}
                </span>
              </label>
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm quyền hoặc module..."
                  className={cn(adminInput, "py-2 pl-9 pr-3 text-xs")}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
              {filteredModules.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Không tìm thấy quyền phù hợp.
                </p>
              ) : (
                filteredModules.map((bucket) => {
                  const ids = bucket.permissions.map((p) => p.id);
                  const selectedInModule = ids.filter((id) =>
                    selectedSet.has(id),
                  ).length;
                  const allSelected =
                    ids.length > 0 && selectedInModule === ids.length;
                  const someSelected =
                    !allSelected && selectedInModule > 0;
                  return (
                    <div
                      key={bucket.moduleId}
                      className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900/60"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {bucket.moduleName}
                          <span className="ml-2 text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                            ({selectedInModule}/{ids.length})
                          </span>
                          {!bucket.moduleStatus ? (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                              TẮT
                            </span>
                          ) : null}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleModule(bucket)}
                          className={cn(
                            "rounded-md border px-2 py-1 text-[11px] font-medium transition",
                            allSelected
                              ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-200"
                              : someSelected
                                ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-200"
                                : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10",
                          )}
                        >
                          {allSelected
                            ? "Bỏ chọn"
                            : someSelected
                              ? "Chọn hết"
                              : "Chọn tất cả"}
                        </button>
                      </div>
                      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {bucket.permissions.map((p) => {
                          const checked = selectedSet.has(p.id);
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => togglePermission(p.id)}
                              aria-pressed={checked}
                              className={cn(
                                "flex w-full cursor-pointer items-start gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition",
                                checked
                                  ? "border-violet-300 bg-violet-50 text-zinc-900 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-white"
                                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-200 dark:hover:bg-white/[0.05]",
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                  checked
                                    ? "border-violet-500 bg-violet-600 text-white"
                                    : "border-zinc-300 bg-white dark:border-white/20 dark:bg-transparent",
                                )}
                              >
                                {checked ? (
                                  <Check
                                    className="h-3 w-3"
                                    strokeWidth={3}
                                  />
                                ) : null}
                              </span>
                              <span className="flex min-w-0 flex-col">
                                <span className="font-medium">
                                  {p.actionName}
                                </span>
                                <span className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                                  {p.name}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3 dark:border-white/10">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {mode.kind === "create" ? "Tạo mới" : "Lưu thay đổi"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
