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
import { ADMIN_ADD_NEW_BUTTON, ADMIN_NATIVE_SELECT } from "@/lib/admin-ui";
import AdminPagination from "@/components/admin/AdminPagination";
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
        label: "Đã từ chối tài khoản NTD",
        className: "bg-zinc-500/20 text-zinc-800 dark:text-zinc-300",
      };
    }
    if (employers.length === 0) {
      return {
        label: "Chưa có nhà tuyển dụng",
        className: "bg-amber-500/20 text-amber-900 dark:text-amber-400",
      };
    }
    if (hasPending) {
      return {
        label: "Chờ duyệt tài khoản NTD",
        className: "bg-amber-500/20 text-amber-900 dark:text-amber-400",
      };
    }
    return {
      label: "Chờ duyệt tài khoản NTD",
      className: "bg-amber-500/20 text-amber-400",
    };
  }

  if (c.status) {
    return {
      label: "Hoạt động",
      className: "bg-green-500/20 text-green-800 dark:text-green-400",
    };
  }
  return {
    label: "Ngừng (khóa bởi admin)",
    className: "bg-red-500/20 text-red-800 dark:text-red-400",
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
      <div className="mt-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Danh sách công ty
          </h2>
          <button
            type="button"
            onClick={() =>
              openModal("create-company", { provinces, categories })
            }
            className={ADMIN_ADD_NEW_BUTTON}
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="relative">
            <input
              onChange={handleSearch}
              defaultValue={searchParams.get("search") || ""}
              placeholder="Tên công ty, địa chỉ, website..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-12 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-violet-500/50"
            />
            <Search
              className="absolute left-3 top-2.5 text-zinc-400 dark:text-gray-400"
              size={18}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              onChange={(e) => handleCategoryChange(e.target.value)}
              defaultValue={searchParams.get("categoryId") || ""}
              className={ADMIN_NATIVE_SELECT}
            >
              <option value="">-- Danh mục --</option>
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
              <option value="">-- Tỉnh/Thành --</option>
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
                {loadingDistrict ? "Đang tải..." : "-- Quận/Huyện --"}
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
              <option value="">-- Trạng thái --</option>
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng</option>
            </select>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#1f1f1f] dark:bg-[#1e1e1e]"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-gray-700">
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
                          className="w-10 h-10 rounded object-cover bg-white"
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
                        <p className="line-clamp-2 break-words text-zinc-800 dark:text-gray-200">
                          {c.location}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-zinc-500 dark:text-gray-500">
                          {c.district?.name}, {c.province?.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-zinc-600 dark:text-gray-300">
                      <span className="rounded bg-blue-500/20 px-2 py-1 text-sm text-blue-800 dark:text-blue-400">
                        {c._count?.jobs ?? 0}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const b = companyListStatusBadge(c);
                        return (
                          <span
                            className={`px-2 py-1 rounded text-sm ${b.className}`}
                          >
                            {b.label}
                          </span>
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
  );
}
