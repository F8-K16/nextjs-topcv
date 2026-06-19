"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { adminSkillsService } from "@/services/admin-skills.service";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  adminInputCompact,
  adminSearchFieldGrow,
  adminSearchFieldWithIcon9,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import { STALE_ADMIN_SKILLS_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";

export function SkillsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const params = new URLSearchParams({
    page: String(page),
    limit: "12",
    search,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "skills", page, search],
    queryFn: () => adminSkillsService.list(params),
    staleTime: STALE_ADMIN_SKILLS_MS,
  });

  const createMut = useMutation({
    mutationFn: () => adminSkillsService.create(name.trim()),
    onSuccess: () => {
      toast.success("Đã thêm kỹ năng");
      setName("");
      qc.invalidateQueries({ queryKey: ["admin", "skills"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không thêm được kỹ năng"),
  });

  const updateMut = useMutation({
    mutationFn: () =>
      adminSkillsService.update(editing!.id, editing!.name.trim()),
    onSuccess: () => {
      toast.success("Đã cập nhật");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "skills"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không cập nhật được kỹ năng"),
  });

  const pushQuery = (next: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === "") p.delete(k);
      else p.set(k, v);
    });
    router.push(`?${p.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
        <p>Không tải được danh sách kỹ năng.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-sm text-amber-800 underline dark:text-amber-200"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Xóa kỹ năng?"
        description="Liên kết job–skill sẽ bị gỡ. Thao tác không hoàn tác."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={async () => {
          if (!deleteId) return;
          setDeleteLoading(true);
          try {
            await adminSkillsService.remove(deleteId);
            toast.success("Đã xóa");
            setDeleteId(null);
            qc.invalidateQueries({ queryKey: ["admin", "skills"] });
          } catch (e) {
            toast.error(getErrorToastMessage(e) || "Không xóa được kỹ năng");
          } finally {
            setDeleteLoading(false);
          }
        }}
      />

      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Kỹ năng
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">
          CRUD kỹ năng dùng gắn vào tin tuyển dụng (JobSkill).
        </p>
      </div>

      <div
        className={cn(
          adminSurfaceCardBlur,
          "flex flex-col gap-3 p-4 sm:flex-row sm:items-end",
        )}
      >
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            defaultValue={search}
            placeholder="Tìm theo tên..."
            className={adminSearchFieldWithIcon9}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                pushQuery({
                  search: (e.target as HTMLInputElement).value,
                  page: "1",
                });
              }
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên kỹ năng mới"
            className={adminSearchFieldGrow}
          />
          <button
            type="button"
            disabled={!name.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}
            className={ADMIN_ADD_NEW_BUTTON}
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(adminSurfaceCardBlur, "overflow-hidden p-0 shadow-xl")}
      >
        <table className={cn("min-w-full text-sm", adminTableDivide)}>
          <thead>
            <tr
              className={cn(
                adminTableHeadRow,
                "uppercase tracking-wide",
              )}
            >
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Số job</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={adminTableDivide}>
            {data.skills.map((s) => (
              <tr
                key={s.id}
                className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  {editing?.id === s.id ? (
                    <input
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                      className={cn(adminInputCompact, "max-w-xs")}
                    />
                  ) : (
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {s.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                  {s._count.jobSkills}
                </td>
                <td className="px-4 py-3 text-right">
                  {editing?.id === s.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                        onClick={() => setEditing(null)}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={updateMut.isPending}
                        className="rounded-lg bg-violet-600 px-3 py-1 text-xs text-white hover:bg-violet-500 disabled:opacity-50"
                        onClick={() => updateMut.mutate()}
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                        onClick={() => setEditing({ id: s.id, name: s.name })}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-200 p-2 text-rose-700 hover:bg-rose-50 dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        onClick={() => setDeleteId(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <AdminPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(p) => pushQuery({ page: String(p) })}
        />
      </motion.div>
    </div>
  );
}
