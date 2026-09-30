"use client";

import { motion } from "framer-motion";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useModal } from "../components/ModalManager";
import { Category } from "@/app/types/category.type";
import { categoryService } from "@/services/category.service";
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
  adminTableMuted,
} from "@/lib/admin-ui";
import {
  AdminPageHeader,
  AdminToolbar,
  AdminToolbarRow,
} from "@/components/admin/admin-page-header";
import { AdminStatusChip } from "@/components/admin/admin-status-chip";
import { cn } from "@/lib/utils";
import AdminPagination from "@/components/admin/AdminPagination";
import { getErrorToastMessage } from "@/lib/submit-error";

export default function CategoriesTable({
  data,
}: {
  data: {
    categories: Category[];
    pagination: {
      page: number;
      totalPages: number;
    };
  };
}) {
  const { categories, pagination } = data;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

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
    if (!confirm("Bạn có chắc muốn xóa category này?")) return;

    try {
      await categoryService.deleteCategory(id);
      toast.success("Xóa thành công");
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Xóa thất bại");
    }
  };

  return (
    <div className={ADMIN_PAGE_STACK}>
      <AdminPageHeader
        title="Danh mục việc làm"
        description="Tổ chức ngành nghề dùng cho tin tuyển dụng và công ty."
        actions={
          <button
            type="button"
            onClick={() => openModal("create-category", undefined)}
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
              placeholder="Tìm..."
              className={adminSearchFieldWithIcon}
            />
            <Search className={ADMIN_SEARCH_ICON} />
          </div>
        </AdminToolbarRow>
      </AdminToolbar>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(adminSurfaceCardBlur, "p-6")}
      >
        <div className="overflow-x-auto">
          <table className={cn(adminTable, adminTableDivide)}>
            <thead>
              <tr className={adminTableHeadRow}>
                {["Tên", "Slug", "Việc làm", "Công ty", "Hành động"].map(
                  (header) => (
                    <th key={header} className="px-6 py-3 text-left uppercase">
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className={adminTableDivide}>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((c, index) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td
                      className={cn(
                        "px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white",
                      )}
                    >
                      {c.name}
                    </td>
                    <td className={cn("px-6 py-4", adminTableMuted)}>
                      {c.slug}
                    </td>

                    <td className="px-6 py-4">
                      <AdminStatusChip tone="info">
                        {c._count?.jobs ?? 0}
                      </AdminStatusChip>
                    </td>

                    <td className="px-6 py-4">
                      <AdminStatusChip tone="violet">
                        {c._count?.companies ?? 0}
                      </AdminStatusChip>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openModal("edit-category", { category: c })
                          }
                          className="text-indigo-700 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="text-red-700 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </motion.div>
    </div>
  );
}
