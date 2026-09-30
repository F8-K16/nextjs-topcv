"use client";

import type { Company, CompanyResponse } from "@/app/types/company.type";
import { motion } from "framer-motion";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useModal } from "../components/ModalManager";
import { companyService } from "@/services/company.service";
import { locationService } from "@/services/location.service";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_NATIVE_SELECT,
  ADMIN_PAGE_STACK,
  ADMIN_SEARCH_ICON,
  ADMIN_SEARCH_WRAP,
  adminSearchFieldWithIcon,
  adminSurfaceCardBlur,
  adminTable,
} from "@/lib/admin-ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { AdminStatusChip } from "@/components/admin/admin-status-chip";
import {
  AdminPageHeader,
  AdminToolbar,
  AdminToolbarRow,
} from "@/components/admin/admin-page-header";
import { cn } from "@/lib/utils";
import { getErrorToastMessage } from "@/lib/submit-error";
function companyListStatusBadge(c: Company) {
  const employers = c.employers ?? [];
  const hasApproved = employers.some((e) => e.status === "APPROVED");
  const hasPending = employers.some((e) => e.status === "PENDING");
  const allRejected =
    employers.length > 0 && employers.every((e) => e.status === "REJECTED");

  if (!hasApproved) {
    if (allRejected) {
      return {
        label: "NTD từ chối",
        tone: "neutral" as const,
      };
    }
    if (employers.length === 0) {
      return {
        label: "Chưa NTD",
        tone: "warning" as const,
      };
    }
    if (hasPending) {
      return {
        label: "Chờ NTD",
        tone: "warning" as const,
      };
    }
    return {
      label: "Chờ NTD",
      tone: "warning" as const,
    };
  }

  if (c.status) {
    return {
      label: "Bật",
      tone: "success" as const,
    };
  }
  return {
    label: "Khóa",
    tone: "danger" as const,
  };
}

export default function CompaniesTable({ data }: { data: CompanyResponse }) {
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const { companies, pagination, provinces, categories } = data;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  const provinceIdParam = searchParams.get("provinceId");
  const provinceId = provinceIdParam ? Number(provinceIdParam) : undefined;

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

  const handleProvinceChange = (provinceId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (provinceId) {
      params.set("provinceId", provinceId);
      params.delete("districtId");
    } else {
      params.delete("provinceId");
      params.delete("districtId");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleDistrictChange = (districtId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (districtId) {
      params.set("districtId", districtId);
    } else {
      params.delete("districtId");
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
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
    if (!confirm("Bạn có chắc muốn xóa công ty này?")) return;

    try {
      await companyService.deleteCompany(id);

      toast.success("Xóa thành công");
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Xóa thất bại");
    }
  };

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistrict(true);
      try {
        const data = await locationService.getDistrictsByProvince(provinceId);
        setDistricts(data);
      } catch (error) {
        toast.error(getErrorToastMessage(error) || "Không tải được quận/huyện");
      } finally {
        setLoadingDistrict(false);
      }
    };

    fetchDistricts();
  }, [provinceId]);

  return (
    <div>
      <div className={ADMIN_PAGE_STACK}>
      <AdminPageHeader
        title="Công ty"
        description="Lọc theo danh mục, tỉnh thành và trạng thái hoạt động."
        actions={
          <button
            type="button"
            onClick={() =>
              openModal("create-company", { provinces, categories })
            }
            className={ADMIN_ADD_NEW_BUTTON}
          >
            <Plus size={14} />
            Thêm mới
          </button>
        }
      />

      <AdminToolbar>
        <AdminToolbarRow>
          <div className={cn(ADMIN_SEARCH_WRAP, "sm:max-w-none xl:max-w-sm")}>
            <input
              onChange={handleSearch}
              defaultValue={searchParams.get("search") || ""}
              placeholder="Tên công ty, địa chỉ, website..."
              className={adminSearchFieldWithIcon}
            />
            <Search className={ADMIN_SEARCH_ICON} />
          </div>
          <select
              onChange={(e) => handleCategoryChange(e.target.value)}
              defaultValue={searchParams.get("categoryId") || ""}
              className={ADMIN_NATIVE_SELECT}
            >
              <option value="">Danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => handleProvinceChange(e.target.value)}
              defaultValue={searchParams.get("provinceId") || ""}
              className={ADMIN_NATIVE_SELECT}
            >
              <option value="">Tỉnh/Thành</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => handleDistrictChange(e.target.value)}
              value={searchParams.get("districtId") || ""}
              disabled={!provinceId || loadingDistrict}
              className={ADMIN_NATIVE_SELECT}
            >
              <option value="">
                {loadingDistrict ? "Đang tải..." : "Quận/Huyện"}
              </option>

              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => handleStatusChange(e.target.value)}
              defaultValue={searchParams.get("status") || ""}
              className={ADMIN_NATIVE_SELECT}
            >
              <option value="">Trạng thái</option>
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng</option>
            </select>
        </AdminToolbarRow>
      </AdminToolbar>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(adminSurfaceCardBlur, "p-4 sm:p-5")}
      >
        <div className="overflow-x-auto">
          <table className={cn(adminTable, "divide-y divide-zinc-200 dark:divide-gray-700")}>
            <thead>
              <tr>
                {[
                  "Công ty",
                  "Website",
                  "Địa điểm",
                  "Việc làm",
                  "Trạng thái",
                  "Hành động",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm uppercase text-zinc-500 dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-gray-700">
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-zinc-500 dark:text-gray-400"
                  >
                    Không tìm thấy công ty nào
                  </td>
                </tr>
              ) : (
                companies.map((c, index) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={c.logo || "/images/logo-default.png"}
                          alt={c.name}
                          width={20}
                          height={20}
                          className="w-10 h-10 rounded object-contain bg-white"
                        />

                        <div className="flex flex-col">
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {c.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-zinc-600 dark:text-gray-300">
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          className="block max-w-45 truncate text-blue-700 hover:underline dark:text-blue-400"
                        >
                          {c.website}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-6 py-4 text-zinc-600 dark:text-gray-300">
                      <div className="min-w-0 max-w-[320px] text-sm">
                        <p className="line-clamp-2 break-words text-[12px] text-zinc-800 dark:text-gray-200">
                          {c.location}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[12px] text-zinc-500 dark:text-gray-500">
                          {c.district?.name}, {c.province?.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-zinc-600 dark:text-gray-300">
                      <AdminStatusChip tone="info">
                        {c._count?.jobs ?? 0}
                      </AdminStatusChip>
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const b = companyListStatusBadge(c);
                        return (
                          <AdminStatusChip
                            tone={b.tone}
                            title={b.label}
                          >
                            {b.label}
                          </AdminStatusChip>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/companies/${c.id}`}
                          className="text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() =>
                            openModal("edit-company", {
                              company: c,
                              provinces,
                              categories,
                            })
                          }
                          className="text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
    </div>
  );
}
