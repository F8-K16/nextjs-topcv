"use client";

import { motion } from "framer-motion";
import {
  Edit,
  LayoutTemplate,
  Plus,
  Search,
  Trash2,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useMemo } from "react";
import { useModal } from "../components/ModalManager";
import { Resume } from "@/app/types/resume.type";
import { resumeService } from "@/services/resume.service";
import { formatDate } from "@/utils/helper";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_PAGE_STACK,
  ADMIN_SEARCH_ICON,
  ADMIN_SEARCH_WRAP,
  adminSearchFieldWithIcon,
  adminSurfaceCardBlur,
  adminTable,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import {
  AdminPageHeader,
  AdminToolbar,
  AdminToolbarRow,
} from "@/components/admin/admin-page-header";
import { AdminStatusChip } from "@/components/admin/admin-status-chip";
import AdminPagination from "@/components/admin/AdminPagination";
import { getErrorToastMessage } from "@/lib/submit-error";
import { parseSharedCvIdFromResumeFileUrl } from "@/lib/cv-resume-url";

type Props = {
  data: {
    resumes: Resume[];
    pagination: {
      page: number;
      totalPages: number;
    };
    candidates: {
      id: number;
      user: {
        username: string;
        email: string;
      };
    }[];
  };
};

export default function ResumesTable({ data }: Props) {
  const { resumes, pagination, candidates } = data;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  const { candidateOrder, resumesByCandidate } = useMemo(() => {
    const order: number[] = [];
    const map = new Map<number, Resume[]>();
    for (const r of resumes) {
      const cid = r.candidate.id;
      if (!map.has(cid)) {
        map.set(cid, []);
        order.push(cid);
      }
      map.get(cid)!.push(r);
    }
    return { candidateOrder: order, resumesByCandidate: map };
  }, [resumes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set("search", value);
    else params.delete("search");

    params.set("page", "1");

    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", page.toString());

    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa CV này?")) return;

    try {
      await resumeService.deleteResume(id);
      toast.success("Xóa thành công");
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Xóa CV thất bại");
    }
  };

  return (
    <div className={ADMIN_PAGE_STACK}>
      <AdminPageHeader
        title="Quản lý CV"
        description="Tìm kiếm hồ sơ theo tiêu đề, tên, email hoặc số điện thoại."
        actions={
          <button
            type="button"
            onClick={() => openModal("create-resume", { candidates })}
            className={ADMIN_ADD_NEW_BUTTON}
          >
            <Plus size={14} />
            Thêm mới
          </button>
        }
      />

      <AdminToolbar>
        <AdminToolbarRow>
          <div className={ADMIN_SEARCH_WRAP}>
            <input
              onChange={handleSearch}
              defaultValue={searchParams.get("search") || ""}
              placeholder="Tìm tiêu đề, Tên, Email, SĐT..."
              className={adminSearchFieldWithIcon}
            />
            <Search className={ADMIN_SEARCH_ICON} />
          </div>
        </AdminToolbarRow>
      </AdminToolbar>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {resumes.length === 0 ? (
          <div
            className={cn(
              adminSurfaceCardBlur,
              "p-10 text-center text-zinc-500 dark:text-zinc-400",
            )}
          >
            Danh sách trống
          </div>
        ) : (
          candidateOrder.map((candidateId, groupIndex) => {
            const list = resumesByCandidate.get(candidateId)!;
            const c = list[0].candidate;
            const completedTemplateCvs = c.user.cvs ?? [];
            const publishedTemplateCvIds = new Set(
              list
                .map((r) => parseSharedCvIdFromResumeFileUrl(r.fileUrl))
                .filter((id): id is number => id != null),
            );
            const templateOnlyNotInResumeTable = completedTemplateCvs.filter(
              (cv) => !publishedTemplateCvIds.has(cv.id),
            );
            const uploadResumeCount = list.filter(
              (r) => parseSharedCvIdFromResumeFileUrl(r.fileUrl) == null,
            ).length;
            const templateAsResumeCount = list.length - uploadResumeCount;

            return (
              <motion.div
                key={candidateId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: groupIndex * 0.04 }}
                className={cn(adminSurfaceCardBlur, "overflow-hidden p-0")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {c.user.username}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        {c.user.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                        <Phone className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        {c.user.userPhone?.phone || "Chưa có"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-700/80 dark:text-zinc-100">
                    {list.length} hồ sơ
                    {uploadResumeCount > 0 && templateAsResumeCount > 0 ? (
                      <span className="ml-1 text-zinc-600 dark:text-zinc-400">
                        ({uploadResumeCount} file · {templateAsResumeCount} từ
                        mẫu)
                      </span>
                    ) : null}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className={cn(adminTable, adminTableDivide)}>
                    <thead>
                      <tr className={cn(adminTableHeadRow, "uppercase")}>
                        <th className="px-4 py-2">Loại</th>
                        <th className="px-4 py-2">Tiêu đề</th>
                        <th className="px-4 py-2">Xem / File</th>
                        <th className="px-4 py-2">Ngày tạo</th>
                        <th className="px-4 py-2">Cập nhật</th>
                        <th className="px-4 py-2 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className={adminTableDivide}>
                      {list.map((resume, index) => {
                        const sharedCvId = parseSharedCvIdFromResumeFileUrl(
                          resume.fileUrl,
                        );
                        const isFromTemplate = sharedCvId != null;

                        return (
                          <motion.tr
                            key={resume.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                          >
                            <td className="px-4 py-3">
                              {isFromTemplate ? (
                                <AdminStatusChip tone="success">
                                  Mẫu
                                </AdminStatusChip>
                              ) : (
                                <AdminStatusChip tone="info">
                                  File
                                </AdminStatusChip>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-900 dark:text-white">
                              {resume.title}
                            </td>
                            <td className="px-4 py-3">
                              {isFromTemplate ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openModal("view-candidate-cv", {
                                      cvId: sharedCvId,
                                      titleHint: resume.title,
                                      candidateLabel: c.user.username,
                                    })
                                  }
                                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                                >
                                  Mở file
                                </button>
                              ) : (
                                <a
                                  href={resume.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Mở file
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                              {formatDate(resume.createdAt!)}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                              {formatDate(resume.updatedAt!)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openModal("edit-resume", {
                                      resume,
                                      candidates,
                                    })
                                  }
                                  className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(resume.id)}
                                  className="text-red-700 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {templateOnlyNotInResumeTable.length > 0 ? (
                  <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
                    <h4 className="mb-0.5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300/95">
                      <LayoutTemplate className="h-3.5 w-3.5" />
                      CV mẫu chưa đăng làm hồ sơ (
                      {templateOnlyNotInResumeTable.length})
                    </h4>
                    <p className="mb-2 text-xs text-zinc-500">
                      Đã hoàn thành trên trình soạn nhưng ứng viên chưa đăng
                      thành hồ sơ ứng tuyển (không trùng các dòng trong bảng).
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {templateOnlyNotInResumeTable.map((cv) => (
                        <li
                          key={cv.id}
                          className="flex flex-wrap items-center gap-2 text-zinc-700 dark:text-zinc-300"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              openModal("view-candidate-cv", {
                                cvId: cv.id,
                                titleHint: cv.title,
                                candidateLabel: c.user.username,
                              })
                            }
                            className="font-medium text-emerald-700 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
                          >
                            {cv.title}
                          </button>
                          <span className="text-xs text-zinc-500">
                            · Mẫu {cv.template?.name || "N/A"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </motion.div>
            );
          })
        )}

        <AdminPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </motion.div>
    </div>
  );
}
