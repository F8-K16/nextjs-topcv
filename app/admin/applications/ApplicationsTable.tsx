"use client";

import {
  fetchAdminApplications,
  updateApplicationStatus,
  type ApplicationStatus,
} from "@/services/admin-applications.service";
import { formatDate } from "@/utils/helper";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  ADMIN_NATIVE_SELECT,
  adminSearchFieldWithIcon,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getErrorToastMessage } from "@/lib/submit-error";
import AdminApplicationDetailModal from "./AdminApplicationDetailModal";

type ApplicationRow = {
  id: number;
  status: ApplicationStatus;
  createdAt: string;
  candidate: {
    id: number;
    user: { id: number; email: string; username: string };
    province?: { name: string } | null;
    district?: { name: string } | null;
  };
  job: {
    id: number;
    title: string;
    company: { id: number; name: string };
  };
  resume?: { id: number; title: string; fileUrl: string } | null;
};

type ListPayload = {
  applications: ApplicationRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "REVIEWED", label: "Đã xem" },
  { value: "ACCEPTED", label: "Đạt" },
  { value: "REJECTED", label: "Loại" },
];

export default function ApplicationsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewApplicationId, setPreviewApplicationId] = useState<
    number | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = Number(searchParams.get("page") || "1");
      const status = searchParams.get("status") || "";
      const search = searchParams.get("search") || "";
      const payload = await fetchAdminApplications({
        page,
        limit: 15,
        status: status || undefined,
        search: search || undefined,
      });
      setData(payload as ListPayload);
    } catch (e) {
      toast.error(
        getErrorToastMessage(e) || "Không tải được danh sách ứng tuyển",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const goPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const onStatusChange = async (id: number, status: ApplicationStatus) => {
    try {
      await updateApplicationStatus(id, status);
      toast.success("Đã cập nhật trạng thái");
      await load();
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Cập nhật thất bại");
    }
  };

  if (loading && !data) {
    return (
      <div className="py-10 text-center text-zinc-500 dark:text-zinc-400">
        Đang tải dữ liệu…
      </div>
    );
  }

  const applications = data?.applications ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Đơn ứng tuyển
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-80 flex-1">
            <input
              type="text"
              placeholder="Email, tên ứng viên, tiêu đề công việc…"
              defaultValue={searchParams.get("search") || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setParam("search", (e.target as HTMLInputElement).value);
                }
              }}
              className={adminSearchFieldWithIcon}
            />
            <Search
              className="pointer-events-none absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500"
              size={18}
            />
          </div>
          <select
            className={ADMIN_NATIVE_SELECT}
            value={searchParams.get("status") || ""}
            onChange={(e) => setParam("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={cn(adminSurfaceCardBlur, "overflow-hidden p-0")}>
        <div className="overflow-x-auto">
          <table className={cn("min-w-full text-sm", adminTableDivide)}>
            <thead>
              <tr className={cn(adminTableHeadRow, "uppercase")}>
                <th className="px-4 py-3">Ứng viên</th>
                <th className="px-4 py-3">Khu vực</th>
                <th className="px-4 py-3">Việc làm / Công ty</th>
                <th className="px-4 py-3">Hồ sơ</th>
                <th className="px-4 py-3">Ngày nộp</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className={adminTableDivide}>
              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    Không có bản ghi
                  </td>
                </tr>
              )}
              {applications.map((row) => {
              const loc = [
                row.candidate.district?.name,
                row.candidate.province?.name,
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <tr
                  key={row.id}
                  className="text-zinc-900 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {row.candidate.user.username}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {row.candidate.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                    {loc || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-zinc-900 dark:text-zinc-100">
                      {row.job.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {row.job.company.name}
                    </div>
                  </td>
                  <td className="max-w-60 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewApplicationId(row.id)}
                        className="w-fit cursor-pointer rounded-lg border border-violet-300 bg-violet-50 px-3 py-1.5 text-left text-xs font-medium text-violet-800 transition hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20"
                      >
                        Xem hồ sơ
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`${ADMIN_NATIVE_SELECT} text-xs`}
                      value={row.status}
                      onChange={(e) =>
                        onStatusChange(
                          row.id,
                          e.target.value as ApplicationStatus,
                        )
                      }
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="REVIEWED">Đã xem</option>
                      <option value="ACCEPTED">Đạt</option>
                      <option value="REJECTED">Loại</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      <AdminApplicationDetailModal
        applicationId={previewApplicationId}
        open={previewApplicationId != null}
        onOpenChange={(open) => {
          if (!open) setPreviewApplicationId(null);
        }}
      />
      {pagination ? (
        <div className={cn(adminSurfaceCardBlur, "mt-4 overflow-hidden p-0")}>
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={goPage}
          />
        </div>
      ) : null}
    </div>
  );
}
