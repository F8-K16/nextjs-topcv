"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { adminLocationsService } from "@/services/admin-locations.service";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { STALE_ADMIN_LOCATIONS_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";
import { cn } from "@/lib/utils";
import {
  adminInputCompact,
  adminSearchField,
  adminSearchFieldGrow,
  adminSearchFieldWithIcon9,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";

const locEmeraldFocus =
  "focus:ring-emerald-500/40 dark:focus:ring-emerald-500/50";

export function LocationsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null,
  );

  const [newProvinceName, setNewProvinceName] = useState("");
  const [newProvinceCode, setNewProvinceCode] = useState("");

  const [editingProvince, setEditingProvince] = useState<{
    id: number;
    name: string;
    code: string;
  } | null>(null);

  const [deleteProvinceId, setDeleteProvinceId] = useState<number | null>(null);
  const [deleteDistrictId, setDeleteDistrictId] = useState<number | null>(null);
  const [deleteProvinceLoading, setDeleteProvinceLoading] = useState(false);
  const [deleteDistrictLoading, setDeleteDistrictLoading] = useState(false);

  const [newDistrictName, setNewDistrictName] = useState("");
  const [editingDistrict, setEditingDistrict] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const provinceParams = new URLSearchParams({
    page: String(page),
    limit: "12",
    search,
  });

  const {
    data: provinceData,
    isLoading: provincesLoading,
    isError: provincesError,
    refetch: refetchProvinces,
  } = useQuery({
    queryKey: ["admin", "locations", "provinces", page, search],
    queryFn: () => adminLocationsService.listProvinces(provinceParams),
    staleTime: STALE_ADMIN_LOCATIONS_MS,
  });

  const {
    data: districtData,
    isLoading: districtsLoading,
    isError: districtsError,
    refetch: refetchDistricts,
  } = useQuery({
    queryKey: ["admin", "locations", "districts", selectedProvinceId],
    queryFn: () =>
      adminLocationsService.listDistricts(selectedProvinceId as number),
    enabled: selectedProvinceId != null,
    staleTime: STALE_ADMIN_LOCATIONS_MS,
  });

  useEffect(() => {
    if (!provinceData?.provinces.length) return;
    if (selectedProvinceId == null) {
      setSelectedProvinceId(provinceData.provinces[0].id);
      return;
    }
    if (!provinceData.provinces.some((p) => p.id === selectedProvinceId)) {
      setSelectedProvinceId(provinceData.provinces[0].id);
    }
  }, [provinceData, selectedProvinceId]);

  const createProvinceMut = useMutation({
    mutationFn: () =>
      adminLocationsService.createProvince({
        name: newProvinceName.trim(),
        ...(newProvinceCode.trim() ? { code: newProvinceCode.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success("Đã thêm tỉnh/thành");
      setNewProvinceName("");
      setNewProvinceCode("");
      qc.invalidateQueries({ queryKey: ["admin", "locations", "provinces"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không thêm được"),
  });

  const updateProvinceMut = useMutation({
    mutationFn: () => {
      const body: { name?: string; code?: string | null } = {};
      if (editingProvince) {
        body.name = editingProvince.name.trim();
        body.code =
          editingProvince.code.trim() === ""
            ? null
            : editingProvince.code.trim();
      }
      return adminLocationsService.updateProvince(editingProvince!.id, body);
    },
    onSuccess: () => {
      toast.success("Đã cập nhật tỉnh/thành");
      setEditingProvince(null);
      qc.invalidateQueries({ queryKey: ["admin", "locations"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không cập nhật được"),
  });

  const createDistrictMut = useMutation({
    mutationFn: () =>
      adminLocationsService.createDistrict({
        provinceId: selectedProvinceId!,
        name: newDistrictName.trim(),
      }),
    onSuccess: () => {
      toast.success("Đã thêm quận/huyện");
      setNewDistrictName("");
      qc.invalidateQueries({ queryKey: ["admin", "locations"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không thêm được"),
  });

  const updateDistrictMut = useMutation({
    mutationFn: () =>
      adminLocationsService.updateDistrict(editingDistrict!.id, {
        name: editingDistrict!.name.trim(),
      }),
    onSuccess: () => {
      toast.success("Đã cập nhật quận/huyện");
      setEditingDistrict(null);
      qc.invalidateQueries({ queryKey: ["admin", "locations"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không cập nhật được"),
  });

  const pushQuery = (next: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === "") p.delete(k);
      else p.set(k, v);
    });
    router.push(`?${p.toString()}`);
  };

  if (provincesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/6" />
      </div>
    );
  }

  if (provincesError || !provinceData) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
        <p>Không tải được danh sách tỉnh/thành.</p>
        <button
          type="button"
          onClick={() => refetchProvinces()}
          className="mt-3 text-sm text-amber-800 underline dark:text-amber-200"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminConfirmDialog
        open={deleteProvinceId != null}
        onOpenChange={(o) => !o && setDeleteProvinceId(null)}
        title="Xóa tỉnh/thành?"
        description="Chỉ xóa được khi không còn quận/huyện và không có công ty/ứng viên gắn tỉnh này."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleteProvinceLoading}
        onConfirm={async () => {
          if (!deleteProvinceId) return;
          setDeleteProvinceLoading(true);
          try {
            await adminLocationsService.deleteProvince(deleteProvinceId);
            toast.success("Đã xóa");
            setDeleteProvinceId(null);
            if (selectedProvinceId === deleteProvinceId) {
              setSelectedProvinceId(null);
            }
            qc.invalidateQueries({ queryKey: ["admin", "locations"] });
          } catch (e) {
            toast.error(getErrorToastMessage(e) || "Không xóa được");
          } finally {
            setDeleteProvinceLoading(false);
          }
        }}
      />

      <AdminConfirmDialog
        open={deleteDistrictId != null}
        onOpenChange={(o) => !o && setDeleteDistrictId(null)}
        title="Xóa quận/huyện?"
        description="Chỉ xóa được khi không có công ty/ứng viên hoặc tùy chọn ưu tiên gắn quận/huyện này."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleteDistrictLoading}
        onConfirm={async () => {
          if (!deleteDistrictId) return;
          setDeleteDistrictLoading(true);
          try {
            await adminLocationsService.deleteDistrict(deleteDistrictId);
            toast.success("Đã xóa");
            setDeleteDistrictId(null);
            qc.invalidateQueries({ queryKey: ["admin", "locations"] });
          } catch (e) {
            toast.error(getErrorToastMessage(e) || "Không xóa được");
          } finally {
            setDeleteDistrictLoading(false);
          }
        }}
      />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-white">
          Địa lý
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">
          Quản lý tỉnh/thành và quận/huyện dùng cho công ty, ứng viên và lọc
          việc làm.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Tỉnh / thành
          </h2>
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
                placeholder="Tìm theo tên hoặc mã..."
                className={cn(adminSearchFieldWithIcon9, locEmeraldFocus)}
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
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              <input
                value={newProvinceName}
                onChange={(e) => setNewProvinceName(e.target.value)}
                placeholder="Tên tỉnh mới"
                className={cn(
                  "w-full min-w-0",
                  adminSearchField,
                  locEmeraldFocus,
                )}
              />
              <input
                value={newProvinceCode}
                onChange={(e) => setNewProvinceCode(e.target.value)}
                placeholder="Mã (tùy chọn)"
                className={cn(
                  "w-full min-w-0",
                  adminSearchField,
                  locEmeraldFocus,
                )}
              />
            </div>
            <button
              type="button"
              disabled={!newProvinceName.trim() || createProvinceMut.isPending}
              onClick={() => createProvinceMut.mutate()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Thêm tỉnh
            </button>
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
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">QH</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className={adminTableDivide}>
                {provinceData.provinces.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      "cursor-pointer text-zinc-800 transition-colors dark:text-zinc-200",
                      selectedProvinceId === p.id
                        ? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:ring-emerald-500/30"
                        : "hover:bg-zinc-50 dark:hover:bg-white/[0.04]",
                    )}
                    onClick={() => setSelectedProvinceId(p.id)}
                  >
                    <td className="px-4 py-3">
                      {editingProvince?.id === p.id ? (
                        <input
                          value={editingProvince.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setEditingProvince({
                              ...editingProvince,
                              name: e.target.value,
                            })
                          }
                          className={cn(adminInputCompact, "max-w-[200px]")}
                        />
                      ) : (
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {p.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingProvince?.id === p.id ? (
                        <input
                          value={editingProvince.code}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setEditingProvince({
                              ...editingProvince,
                              code: e.target.value,
                            })
                          }
                          placeholder="Mã"
                          className={cn(adminInputCompact, "max-w-[100px]")}
                        />
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {p.code ?? "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                      {p._count.districts}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {editingProvince?.id === p.id ? (
                          <>
                            <button
                              type="button"
                              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                              onClick={() => setEditingProvince(null)}
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              disabled={updateProvinceMut.isPending}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
                              onClick={() => updateProvinceMut.mutate()}
                            >
                              Lưu
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                              onClick={() =>
                                setEditingProvince({
                                  id: p.id,
                                  name: p.name,
                                  code: p.code ?? "",
                                })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-zinc-200 p-2 text-rose-700 hover:bg-rose-50 dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-500/10"
                              onClick={() => setDeleteProvinceId(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <AdminPagination
              page={provinceData.pagination.page}
              totalPages={provinceData.pagination.totalPages}
              onPageChange={(pg) => pushQuery({ page: String(pg) })}
            />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
            Quận / huyện
            {districtData?.province ? (
              <span className="ml-2 font-normal text-zinc-500">
                — {districtData.province.name}
              </span>
            ) : null}
          </h2>

          {!selectedProvinceId ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center text-sm text-zinc-600 dark:border-white/15 dark:bg-white/[0.02] dark:text-zinc-500">
              Chọn một tỉnh/thành bên trái để xem và chỉnh sửa quận/huyện.
            </div>
          ) : districtsLoading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
          ) : districtsError || !districtData ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
              <p>Không tải được quận/huyện.</p>
              <button
                type="button"
                onClick={() => refetchDistricts()}
                className="mt-3 text-sm text-amber-800 underline dark:text-amber-200"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  adminSurfaceCardBlur,
                  "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
                )}
              >
                <input
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  placeholder="Tên quận/huyện mới"
                  className={cn(adminSearchFieldGrow, locEmeraldFocus)}
                />
                <button
                  type="button"
                  disabled={
                    !newDistrictName.trim() || createDistrictMut.isPending
                  }
                  onClick={() => createDistrictMut.mutate()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Thêm quận/huyện
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  adminSurfaceCardBlur,
                  "overflow-hidden p-0 shadow-xl",
                )}
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
                      <th className="px-4 py-3">CT</th>
                      <th className="px-4 py-3">UV</th>
                      <th className="px-4 py-3">ƯT</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className={adminTableDivide}>
                    {districtData.districts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                        >
                          Chưa có quận/huyện. Thêm mới ở trên.
                        </td>
                      </tr>
                    ) : (
                      districtData.districts.map((d) => (
                        <tr
                          key={d.id}
                          className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                        >
                          <td className="px-4 py-3">
                            {editingDistrict?.id === d.id ? (
                              <input
                                value={editingDistrict.name}
                                onChange={(e) =>
                                  setEditingDistrict({
                                    ...editingDistrict,
                                    name: e.target.value,
                                  })
                                }
                                className={cn(adminInputCompact, "max-w-xs")}
                              />
                            ) : (
                              <span className="font-medium text-zinc-900 dark:text-white">
                                {d.name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {d._count.companies}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {d._count.candidates}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                            {d._count.preferences}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingDistrict?.id === d.id ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                                  onClick={() => setEditingDistrict(null)}
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={updateDistrictMut.isPending}
                                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
                                  onClick={() => updateDistrictMut.mutate()}
                                >
                                  Lưu
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                                  onClick={() =>
                                    setEditingDistrict({
                                      id: d.id,
                                      name: d.name,
                                    })
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-200 p-2 text-rose-700 hover:bg-rose-50 dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-500/10"
                                  onClick={() => setDeleteDistrictId(d.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
