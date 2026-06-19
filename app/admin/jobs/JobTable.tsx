"use client";

import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  JOB_MODERATION_OPTIONS,
  JobsResponse,
} from "@/app/types/job.type";
import { toast } from "sonner";
import { formatDate, formatSalaryShort } from "@/utils/helper";
import { useModal } from "../components/ModalManager";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { jobService } from "@/services/job.service";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_FILTER_FIELD,
  ADMIN_FILTER_GRID,
  ADMIN_FILTER_LABEL,
  ADMIN_FILTER_SELECT_WIDE,
  ADMIN_NATIVE_OPTION,
  adminDropdownItem,
  adminDropdownPanel,
  adminKebabButton,
  adminSearchFieldWithIcon,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { getErrorToastMessage } from "@/lib/submit-error";
import Image from "next/image";

export default function JobsTable({ data }: { data: JobsResponse }) {
  const {
    jobs,
    pagination,
    categories,
    companies,
    JOB_TYPE_OPTIONS,
    EXPERIENCE_OPTIONS,
    SalaryRangeOptions,
    JOB_MODERATION_OPTIONS: modFromApi,
  } = data;

  const modOptions = modFromApi?.length ? modFromApi : JOB_MODERATION_OPTIONS;

  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  const [menuJobId, setMenuJobId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", e.target.value);
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

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const runDelete = async () => {
    if (!confirmDeleteId) return;
    setConfirmLoading(true);
    try {
      await jobService.deleteJob(confirmDeleteId);
      await invalidatePublicJobListQueries(queryClient);
      toast.success("Xóa thành công");
      setConfirmDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Xóa việc làm thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  const badgeMod = (s: string | undefined) => {
    const v = s || "APPROVED";
    if (v === "APPROVED")
      return "bg-emerald-100 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20";
    if (v === "PENDING")
      return "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/20";
    return "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/20";
  };

  return (
    <div>
      <AdminConfirmDialog
        open={confirmDeleteId != null}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
        title="Xóa việc làm?"
        description="Ứng tuyển liên quan cũng sẽ bị xóa. Thao tác không hoàn tác."
        confirmLabel="Xóa tin"
        variant="destructive"
        loading={confirmLoading}
        onConfirm={runDelete}
      />

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
        Danh sách việc làm
      </h1>

      <div className="mt-4 mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <span className={ADMIN_FILTER_LABEL}>Tìm kiếm</span>
            <div className="relative mt-1">
              <input
                placeholder="Tìm tiêu đề..."
                onChange={handleSearch}
                defaultValue={searchParams.get("search") || ""}
                className={adminSearchFieldWithIcon}
              />
              <Search
                className="pointer-events-none absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500"
                size={18}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              openModal("create-job", {
                companies,
                categories,
                jobTypeOptions: JOB_TYPE_OPTIONS,
                experienceOptions: EXPERIENCE_OPTIONS,
              })
            }
            className={`${ADMIN_ADD_NEW_BUTTON} shrink-0`}
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>

        <div className={ADMIN_FILTER_GRID}>
          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Duyệt tin</span>
            <select
              onChange={(e) => handleFilter("moderationStatus", e.target.value)}
              defaultValue={searchParams.get("moderationStatus") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option className={ADMIN_NATIVE_OPTION} value="">
                Tất cả trạng thái duyệt
              </option>
              {modOptions.map((c) => (
                <option
                  className={ADMIN_NATIVE_OPTION}
                  key={c.value}
                  value={c.value}
                >
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Hiển thị / hạn</span>
            <select
              onChange={(e) => handleFilter("lifecycle", e.target.value)}
              defaultValue={searchParams.get("lifecycle") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Mọi tin (theo hạn)</option>
              <option value="active">Đang hiệu lực</option>
              <option value="expired">Đã hết hạn</option>
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Nổi bật</span>
            <select
              onChange={(e) => handleFilter("isFeatured", e.target.value)}
              defaultValue={searchParams.get("isFeatured") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Tất cả tin</option>
              <option value="true">Chỉ tin nổi bật</option>
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Danh mục</span>
            <select
              onChange={(e) => handleFilter("categoryId", e.target.value)}
              defaultValue={searchParams.get("categoryId") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Mọi danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Công ty</span>
            <select
              onChange={(e) => handleFilter("companyId", e.target.value)}
              defaultValue={searchParams.get("companyId") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Mọi công ty</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Hình thức</span>
            <select
              onChange={(e) => handleFilter("jobType", e.target.value)}
              defaultValue={searchParams.get("jobType") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Mọi hình thức</option>
              {JOB_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Kinh nghiệm</span>
            <select
              onChange={(e) => handleFilter("experienceLevel", e.target.value)}
              defaultValue={searchParams.get("experienceLevel") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Mọi cấp độ</option>
              {EXPERIENCE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className={ADMIN_FILTER_FIELD}>
            <span className={ADMIN_FILTER_LABEL}>Mức lương</span>
            <select
              onChange={(e) => handleFilter("salaryRange", e.target.value)}
              defaultValue={searchParams.get("salaryRange") || ""}
              className={ADMIN_FILTER_SELECT_WIDE}
            >
              <option value="">Mọi mức lương</option>
              {SalaryRangeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(adminSurfaceCardBlur, "overflow-hidden p-0")}
      >
        <div className="overflow-x-auto">
          <table className={cn("min-w-full text-sm", adminTableDivide)}>
            <thead>
              <tr
                className={cn(
                  adminTableHeadRow,
                  "uppercase tracking-wide",
                )}
              >
                <th className="px-4 py-3">Việc làm</th>
                <th className="px-4 py-3">Công ty</th>
                <th className="px-4 py-3">Địa điểm</th>
                <th className="px-4 py-3">Lương</th>
                <th className="px-4 py-3">Hạn</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className={adminTableDivide}>
              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    Không có tin phù hợp bộ lọc.
                  </td>
                </tr>
              )}
              {jobs.map((job, index) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-800">
                        <Image
                          src={job.company.logo || "/images/logo-default.png"}
                          alt={job.company.name}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-clamp-2 font-medium text-zinc-900 dark:text-white">
                            {job.title}
                          </span>
                          {job.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800 ring-1 ring-violet-300 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-500/30">
                              <Sparkles className="h-3 w-3" />
                              Nổi bật
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                          {job.category?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {job.company?.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {job.workLocation ||
                      [job.company?.district?.name, job.company?.province?.name]
                        .filter(Boolean)
                        .join(", ") ||
                      job.company?.location ||
                      "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-300/90">
                    {formatSalaryShort(job.minSalary, job.maxSalary)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {job.deadline ? formatDate(job.deadline) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badgeMod(job.moderationStatus)}`}
                    >
                      {modOptions.find((m) => m.value === job.moderationStatus)
                        ?.label ||
                        job.moderationStatus ||
                        "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-flex justify-end">
                      <button
                        type="button"
                        aria-label="Thao tác"
                        onClick={() =>
                          setMenuJobId((v) => (v === job.id ? null : job.id))
                        }
                        className={adminKebabButton}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {menuJobId === job.id && (
                        <>
                          <button
                            type="button"
                            aria-label="Đóng"
                            className="fixed inset-0 z-10 cursor-default bg-transparent"
                            onClick={() => setMenuJobId(null)}
                          />
                          <div className={cn(adminDropdownPanel, "w-52")}>
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              className={adminDropdownItem}
                              onClick={() => setMenuJobId(null)}
                            >
                              <Eye size={16} />
                              Chi tiết
                            </Link>
                            <button
                              type="button"
                              className={adminDropdownItem}
                              onClick={() => {
                                setMenuJobId(null);
                                openModal("edit-job", {
                                  job,
                                  companies,
                                  jobTypeOptions: JOB_TYPE_OPTIONS,
                                  experienceOptions: EXPERIENCE_OPTIONS,
                                });
                              }}
                            >
                              <Edit size={16} />
                              Sửa tin
                            </button>
                            {job.moderationStatus !== "APPROVED" ? (
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
                                onClick={async () => {
                                  try {
                                    await jobService.patchJobModeration(
                                      job.id,
                                      "APPROVED",
                                    );
                                    await invalidatePublicJobListQueries(
                                      queryClient,
                                    );
                                    toast.success("Đã duyệt tin");
                                    setMenuJobId(null);
                                    router.refresh();
                                  } catch (e) {
                                    toast.error(
                                      getErrorToastMessage(e) ||
                                        "Không duyệt được tin",
                                    );
                                  }
                                }}
                              >
                                Duyệt tin
                              </button>
                            ) : null}
                            {job.moderationStatus !== "REJECTED" ? (
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10"
                                onClick={async () => {
                                  try {
                                    await jobService.patchJobModeration(
                                      job.id,
                                      "REJECTED",
                                    );
                                    await invalidatePublicJobListQueries(
                                      queryClient,
                                    );
                                    toast.success("Đã từ chối tin");
                                    setMenuJobId(null);
                                    router.refresh();
                                  } catch (e) {
                                    toast.error(
                                      getErrorToastMessage(e) ||
                                        "Không từ chối được tin",
                                    );
                                  }
                                }}
                              >
                                Từ chối tin
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-violet-800 hover:bg-violet-50 dark:text-violet-200 dark:hover:bg-violet-500/10"
                              onClick={async () => {
                                try {
                                  await jobService.patchJobFeatured(
                                    job.id,
                                    !job.isFeatured,
                                  );
                                  await invalidatePublicJobListQueries(
                                    queryClient,
                                  );
                                  toast.success(
                                    job.isFeatured
                                      ? "Đã bỏ nổi bật"
                                      : "Đã ghim nổi bật",
                                  );
                                  setMenuJobId(null);
                                  router.refresh();
                                } catch (e) {
                                  toast.error(
                                    getErrorToastMessage(e) ||
                                      "Không cập nhật được nổi bật",
                                  );
                                }
                              }}
                            >
                              {job.isFeatured ? "Bỏ nổi bật" : "Ghim nổi bật"}
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                              onClick={() => {
                                setMenuJobId(null);
                                setConfirmDeleteId(job.id);
                              }}
                            >
                              <Trash2 size={16} />
                              Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </motion.div>
    </div>
  );
}
