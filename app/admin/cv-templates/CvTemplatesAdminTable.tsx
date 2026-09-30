"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePenLine, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { toast } from "sonner";

import UploadButton from "@/components/UploadButton";

import { cvService } from "@/services/cv.service";
import type { CvTemplate } from "@/app/types/cv.type";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_PAGE_STACK,
  adminInput,
  adminSurfaceCardBlur,
  adminTable,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusChip } from "@/components/admin/admin-status-chip";
import { getErrorToastMessage } from "@/lib/submit-error";
import AdminPagination from "@/components/admin/AdminPagination";

type FormState = {
  name: string;
  description: string;
  thumbnailUrl: string;
  status: boolean;
  templateDataText: string;
};

const emptyTemplateData = JSON.stringify(
  {
    layout: "single-column",
    meta: { theme: "green", fontScale: 1 },
    blocks: [],
    sections: [],
  },
  null,
  2,
);

const toFormState = (template?: CvTemplate): FormState => ({
  name: template?.name ?? "",
  description: template?.description ?? "",
  thumbnailUrl: template?.thumbnailUrl ?? "",
  status: template?.status ?? true,
  templateDataText: JSON.stringify(
    template?.templateData ?? JSON.parse(emptyTemplateData),
    null,
    2,
  ),
});

export default function CvTemplatesAdminTable() {
  const queryClient = useQueryClient();
  const PAGE_SIZE = 10;
  const [editing, setEditing] = useState<CvTemplate | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<FormState>(() => toFormState());

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin-cv-templates"],
    queryFn: () => cvService.listTemplatesAdmin(),
  });

  const sorted = useMemo(
    () =>
      [...templates].sort((a, b) => {
        const aTime = new Date(a.updatedAt ?? a.createdAt ?? "").getTime();
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? "").getTime();
        return bTime - aTime;
      }),
    [templates],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTemplates = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [safePage, sorted]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-cv-templates"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(form.templateDataText) as Record<string, unknown>;
      } catch {
        throw new Error("templateData JSON không hợp lệ");
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        status: form.status,
        templateData: parsed,
      };

      if (!payload.name) throw new Error("Tên mẫu CV không được để trống");
      if (editing) {
        return cvService.updateTemplateAdmin(editing.id, payload);
      }
      return cvService.createTemplateAdmin(payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Cập nhật mẫu CV thành công" : "Tạo mẫu CV thành công");
      await refresh();
      setOpenForm(false);
      setEditing(null);
      setForm(toFormState());
    },
    onError: (error: unknown) => {
      toast.error(getErrorToastMessage(error) || "Lưu mẫu CV thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cvService.deleteTemplateAdmin(id),
    onSuccess: async () => {
      toast.success("Đã xóa mẫu CV");
      await refresh();
    },
    onError: (error: unknown) => {
      toast.error(getErrorToastMessage(error) || "Xóa mẫu CV thất bại");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(toFormState());
    setOpenForm(true);
  };

  const openEdit = (template: CvTemplate) => {
    setEditing(template);
    setForm(toFormState(template));
    setOpenForm(true);
  };

  return (
    <div className={ADMIN_PAGE_STACK}>
      <AdminPageHeader
        title="Quản lý mẫu CV"
        description="Tạo và chỉnh mẫu dùng trong trình soạn thảo CV."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className={ADMIN_ADD_NEW_BUTTON}
          >
            <Plus size={14} />
            Tạo mẫu CV
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400 dark:text-white" />
        </div>
      ) : sorted.length === 0 ? (
        <div
          className={cn(
            adminSurfaceCardBlur,
            "p-10 text-center text-zinc-500 dark:text-zinc-400",
          )}
        >
          Chưa có mẫu CV
        </div>
      ) : (
        <div className={cn(adminSurfaceCardBlur, "overflow-hidden p-0")}>
          <div className="overflow-x-auto">
            <table className={cn(adminTable, adminTableDivide)}>
              <thead>
                <tr className={cn(adminTableHeadRow, "uppercase")}>
                  <th className="px-4 py-2">Tên mẫu</th>
                  <th className="px-4 py-2">Mô tả</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Cập nhật</th>
                  <th className="px-4 py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className={adminTableDivide}>
                {pagedTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-white">
                      {template.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                      {template.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <AdminStatusChip
                        tone={template.status ? "success" : "neutral"}
                      >
                        {template.status ? "Dùng" : "Ẩn"}
                      </AdminStatusChip>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {template.updatedAt
                        ? new Date(template.updatedAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(template)}
                          className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <FilePenLine size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Bạn có chắc muốn xóa mẫu CV này?")) {
                              deleteMutation.mutate(template.id);
                            }
                          }}
                          className="text-red-700 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {openForm ? (
        <div className={cn(adminSurfaceCardBlur, "p-5")}>
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
            {editing ? "Cập nhật mẫu CV" : "Tạo mẫu CV mới"}
          </h3>

          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Tên mẫu"
            className={adminInput}
          />
          <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 dark:border-white/15 dark:bg-white/5">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              Ảnh thumbnail
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              JPG, PNG hoặc WEBP. Ảnh này hiện trên danh sách mẫu CV.
            </p>
            <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-black/30">
                {form.thumbnailUrl ? (
                  <Image
                    src={form.thumbnailUrl}
                    alt="Ảnh thumbnail mẫu CV"
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UploadButton
                  signatureEndpoint="/api/sign-cloudinary-params"
                  className="cursor-pointer rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
                  uploadPreset="F8_TopCV"
                  options={{ tags: ["cv-template-thumbnail"] }}
                  onSuccess={(results: CloudinaryUploadWidgetResults) => {
                    const info = results?.info;
                    const url =
                      typeof info === "object" && info !== null
                        ? info.secure_url
                        : undefined;
                    if (url) {
                      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
                    }
                  }}
                >
                  Tải ảnh lên
                </UploadButton>
                {form.thumbnailUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, thumbnailUrl: "" }))
                    }
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
                  >
                    Xóa ảnh
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Mô tả"
            className={cn(adminInput, "mt-3")}
          />
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.checked }))
              }
            />
            Kích hoạt mẫu
          </label>
          <textarea
            value={form.templateDataText}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, templateDataText: e.target.value }))
            }
            rows={18}
            className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-black/30 dark:text-zinc-100 dark:focus:ring-violet-500/50"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-60"
            >
              {saveMutation.isPending ? "Đang lưu..." : "Lưu mẫu"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenForm(false);
                setEditing(null);
              }}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Hủy
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
