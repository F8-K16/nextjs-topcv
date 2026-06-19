"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Save, Trash2, X } from "lucide-react";

import AdminPagination from "@/components/admin/AdminPagination";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  adminCategoriesService,
  type AdminChildCategoryRow,
  type AdminParentCategoryRow,
} from "@/services/admin-categories.service";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  adminCardSubtitle,
  adminCardTitle,
  adminInputCompact,
  adminRowSelected,
  adminSearchFieldGrow,
  adminSearchFieldWide,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableEmptyCell,
  adminTableHeadRow,
  adminTableMuted,
} from "@/lib/admin-ui";
import { getErrorToastMessage } from "@/lib/submit-error";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoriesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";

  const [selectedParentIdInput, setSelectedParentIdInput] = useState<
    number | null
  >(null);
  const [createParentName, setCreateParentName] = useState("");
  const [createChildName, setCreateChildName] = useState("");

  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [editingParentName, setEditingParentName] = useState("");

  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [editingChildName, setEditingChildName] = useState("");

  const [deleteParentId, setDeleteParentId] = useState<number | null>(null);
  const [deleteChildId, setDeleteChildId] = useState<number | null>(null);

  const parentsQuery = useQuery({
    queryKey: ["admin", "categories", "parents", { page, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search.trim()) params.set("search", search.trim());
      const data = await adminCategoriesService.listParentCategories(params);
      return data;
    },
  });

  const parents = useMemo(
    () => parentsQuery.data?.categories ?? [],
    [parentsQuery.data?.categories],
  );
  const selectedParentId = useMemo(() => {
    if (!parents.length) return null;
    if (
      selectedParentIdInput != null &&
      parents.some((p) => p.id === selectedParentIdInput)
    ) {
      return selectedParentIdInput;
    }
    return parents[0]!.id;
  }, [parents, selectedParentIdInput]);

  const childrenQuery = useQuery({
    queryKey: [
      "admin",
      "categories",
      "children",
      { parentId: selectedParentId },
    ],
    enabled: selectedParentId != null,
    queryFn: async () => {
      return await adminCategoriesService.listChildCategories(
        selectedParentId!,
      );
    },
  });

  const children = childrenQuery.data ?? [];
  const selectedParent = useMemo(
    () => parents.find((p) => p.id === selectedParentId) ?? null,
    [parents, selectedParentId],
  );

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
    ]);
  };

  const createParentMut = useMutation({
    mutationFn: adminCategoriesService.createParentCategory,
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const createChildMut = useMutation({
    mutationFn: adminCategoriesService.createCategory,
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const updateParentMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string; slug?: string } }) =>
      adminCategoriesService.updateParentCategory(id, body),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const updateChildMut = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: { name?: string; slug?: string; parentCategoryId?: number };
    }) => adminCategoriesService.updateCategory(id, body),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const deleteParentMut = useMutation({
    mutationFn: (id: number) => adminCategoriesService.deleteParentCategory(id),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const deleteChildMut = useMutation({
    mutationFn: (id: number) => adminCategoriesService.deleteCategory(id),
    onSuccess: async () => {
      await invalidateAll();
    },
  });

  const pushQuery = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") params.delete(k);
      else params.set(k, v);
    }
    router.push(`?${params.toString()}`);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    pushQuery({ search: (e.currentTarget.value || "").trim(), page: "1" });
  };

  const onPageChange = (p: number) => {
    pushQuery({ page: String(p) });
  };

  const startEditParent = (row: AdminParentCategoryRow) => {
    setEditingParentId(row.id);
    setEditingParentName(row.name);
  };

  const cancelEditParent = () => {
    setEditingParentId(null);
    setEditingParentName("");
  };

  const saveEditParent = async (id: number) => {
    try {
      const name = editingParentName.trim();
      if (!name) return;
      await updateParentMut.mutateAsync({ id, body: { name } });
      toast.success("Đã cập nhật danh mục việc làm");
      cancelEditParent();
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Cập nhật thất bại");
    }
  };

  const startEditChild = (row: AdminChildCategoryRow) => {
    setEditingChildId(row.id);
    setEditingChildName(row.name);
  };

  const cancelEditChild = () => {
    setEditingChildId(null);
    setEditingChildName("");
  };

  const saveEditChild = async (id: number) => {
    try {
      const name = editingChildName.trim();
      if (!name) return;
      await updateChildMut.mutateAsync({ id, body: { name } });
      toast.success("Đã cập nhật vị trí chuyên môn");
      cancelEditChild();
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Cập nhật thất bại");
    }
  };

  const createParent = async () => {
    try {
      const name = createParentName.trim();
      if (!name) return;
      await createParentMut.mutateAsync({
        name,
        slug: slugify(name),
      });
      setCreateParentName("");
      toast.success("Đã thêm danh mục việc làm");
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Thêm thất bại");
    }
  };

  const createChild = async () => {
    try {
      const parentId = selectedParentId;
      const name = createChildName.trim();
      if (!parentId || !name) return;
      await createChildMut.mutateAsync({
        name,
        slug: slugify(name),
        parentCategoryId: parentId,
      });
      setCreateChildName("");
      toast.success("Đã thêm vị trí chuyên môn");
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Thêm thất bại");
    }
  };

  const confirmDeleteParent = async () => {
    if (deleteParentId == null) return;
    try {
      await deleteParentMut.mutateAsync(deleteParentId);
      toast.success("Đã xóa danh mục việc làm");
      setDeleteParentId(null);
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Xóa thất bại");
    }
  };

  const confirmDeleteChild = async () => {
    if (deleteChildId == null) return;
    try {
      await deleteChildMut.mutateAsync(deleteChildId);
      toast.success("Đã xóa vị trí chuyên môn");
      setDeleteChildId(null);
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Xóa thất bại");
    }
  };

  return (
    <div className="space-y-4">
      <AdminConfirmDialog
        open={deleteParentId != null}
        title="Xóa danh mục việc làm"
        description="Bạn có chắc muốn xóa danh mục này? Nếu còn vị trí chuyên môn, hệ thống sẽ không cho xóa."
        loading={deleteParentMut.isPending}
        onOpenChange={(open) => {
          if (!open) setDeleteParentId(null);
        }}
        onConfirm={confirmDeleteParent}
      />
      <AdminConfirmDialog
        open={deleteChildId != null}
        title="Xóa vị trí chuyên môn"
        description="Bạn có chắc muốn xóa vị trí chuyên môn này?"
        loading={deleteChildMut.isPending}
        onOpenChange={(open) => {
          if (!open) setDeleteChildId(null);
        }}
        onConfirm={confirmDeleteChild}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className={cn(adminSurfaceCardBlur, "p-4")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={adminCardTitle}>Danh mục việc làm</h2>
              <p className={adminCardSubtitle}>
                Quản lý nhóm ngành. Chọn một danh mục để quản lý vị trí chuyên
                môn.
              </p>
            </div>
            <input
              defaultValue={search}
              onKeyDown={onSearchKeyDown}
              placeholder="Tìm theo tên/slug…"
              className={adminSearchFieldWide}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={createParentName}
              onChange={(e) => setCreateParentName(e.target.value)}
              placeholder="Tên danh mục việc làm (vd: Data)"
              className={adminSearchFieldGrow}
            />
            <button
              type="button"
              onClick={createParent}
              disabled={createParentMut.isPending}
              className={ADMIN_ADD_NEW_BUTTON}
            >
              Thêm
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className={cn("min-w-full", adminTableDivide)}>
              <thead>
                <tr className={adminTableHeadRow}>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Vị trí chuyên môn</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody className={adminTableDivide}>
                {parentsQuery.isLoading ? (
                  <tr>
                    <td colSpan={4} className={adminTableEmptyCell}>
                      Đang tải…
                    </td>
                  </tr>
                ) : parents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={adminTableEmptyCell}>
                      Không có danh mục việc làm
                    </td>
                  </tr>
                ) : (
                  parents.map((row) => {
                    const selected = row.id === selectedParentId;
                    const isEditing = editingParentId === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={cn(selected && adminRowSelected)}
                      >
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <input
                              value={editingParentName}
                              onChange={(e) =>
                                setEditingParentName(e.target.value)
                              }
                              className={adminInputCompact}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedParentIdInput(row.id)}
                              className="text-left text-sm font-semibold text-zinc-900 hover:underline dark:text-white"
                            >
                              {row.name}
                            </button>
                          )}
                        </td>
                        <td className={cn("px-3 py-2", adminTableMuted)}>
                          {row.slug}
                        </td>
                        <td className={cn("px-3 py-2", adminTableMuted)}>
                          {row._count?.categories ?? 0}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEditParent(row.id)}
                                  className="rounded-lg p-2 text-emerald-700 hover:bg-zinc-100 dark:text-emerald-300 dark:hover:bg-white/10"
                                  title="Lưu"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditParent}
                                  className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-white/70 dark:hover:bg-white/10"
                                  title="Hủy"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditParent(row)}
                                  className="rounded-lg p-2 text-indigo-700 hover:bg-zinc-100 dark:text-indigo-300 dark:hover:bg-white/10"
                                  title="Sửa"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteParentId(row.id)}
                                  className="rounded-lg p-2 text-red-700 hover:bg-zinc-100 dark:text-red-300 dark:hover:bg-white/10"
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {parentsQuery.data?.pagination ? (
            <div className="mt-3">
              <AdminPagination
                page={parentsQuery.data.pagination.page}
                totalPages={parentsQuery.data.pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          ) : null}
        </div>

        <div className={cn(adminSurfaceCardBlur, "p-4")}>
          <div>
            <h2 className={adminCardTitle}>Vị trí chuyên môn</h2>
            <p className={adminCardSubtitle}>
              {selectedParent
                ? `Thuộc: ${selectedParent.name}`
                : "Chọn danh mục việc làm để xem"}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={createChildName}
              onChange={(e) => setCreateChildName(e.target.value)}
              placeholder="Tên vị trí chuyên môn (vd: Data Engineer)"
              className={adminSearchFieldGrow}
              disabled={selectedParentId == null}
            />
            <button
              type="button"
              onClick={createChild}
              disabled={selectedParentId == null || createChildMut.isPending}
              className={ADMIN_ADD_NEW_BUTTON}
            >
              Thêm
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className={cn("min-w-full", adminTableDivide)}>
              <thead>
                <tr className={adminTableHeadRow}>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Việc làm</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody className={adminTableDivide}>
                {selectedParentId == null ? (
                  <tr>
                    <td colSpan={4} className={adminTableEmptyCell}>
                      Chọn danh mục việc làm để quản lý vị trí chuyên môn
                    </td>
                  </tr>
                ) : childrenQuery.isLoading ? (
                  <tr>
                    <td colSpan={4} className={adminTableEmptyCell}>
                      Đang tải…
                    </td>
                  </tr>
                ) : children.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={adminTableEmptyCell}>
                      Chưa có vị trí chuyên môn
                    </td>
                  </tr>
                ) : (
                  children.map((row) => {
                    const isEditing = editingChildId === row.id;
                    return (
                      <tr key={row.id}>
                        <td className="px-3 py-2">
                          {isEditing ? (
                            <input
                              value={editingChildName}
                              onChange={(e) =>
                                setEditingChildName(e.target.value)
                              }
                              className={adminInputCompact}
                            />
                          ) : (
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {row.name}
                            </span>
                          )}
                        </td>
                        <td className={cn("px-3 py-2", adminTableMuted)}>
                          {row.slug}
                        </td>
                        <td className={cn("px-3 py-2", adminTableMuted)}>
                          {row._count?.jobs ?? 0}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEditChild(row.id)}
                                  className="rounded-lg p-2 text-emerald-700 hover:bg-zinc-100 dark:text-emerald-300 dark:hover:bg-white/10"
                                  title="Lưu"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditChild}
                                  className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-white/70 dark:hover:bg-white/10"
                                  title="Hủy"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditChild(row)}
                                  className="rounded-lg p-2 text-indigo-700 hover:bg-zinc-100 dark:text-indigo-300 dark:hover:bg-white/10"
                                  title="Sửa"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteChildId(row.id)}
                                  className="rounded-lg p-2 text-red-700 hover:bg-zinc-100 dark:text-red-300 dark:hover:bg-white/10"
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
