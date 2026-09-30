"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCompanyFilterStore } from "@/app/stores/company.store";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  BriefcaseBusiness,
} from "lucide-react";
import Image from "next/image";
import { companyService } from "@/services/company.service";
import { STALE_PUBLIC_COMPANY_LIST_MS } from "@/lib/query-stale-time";
import { companyFiltersToStableQuery } from "@/lib/stable-query-key";
import { companyPublicPath } from "@/lib/company-path";

export default function CompanySection() {
  const { filters, setFilter } = useCompanyFilterStore();
  const router = useRouter();

  const query = useMemo(
    () => companyFiltersToStableQuery(filters),
    [filters],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["companies", query],
    queryFn: () => companyService.getCompanies(query),
    placeholderData: (prev) => prev,
    staleTime: STALE_PUBLIC_COMPANY_LIST_MS,
  });

  if (isLoading) {
    return <div className="py-10 text-center">Đang tải...</div>;
  }

  if (!data || data.companies.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        Không có công ty phù hợp.
      </div>
    );
  }

  const currentPage = filters.page;
  const totalPages = data.pagination.totalPages;

  return (
    <div className="space-y-6">
      {isFetching && (
        <div className="text-sm text-gray-500">Đang cập nhật dữ liệu...</div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.companies.map((company) => (
          <div
            key={company.id}
            onClick={() => router.push(companyPublicPath(company))}
            className="rounded-xl bg-linear-to-br from-[#fff4df] to white border border-[#ffbb50] p-4 hover:shadow-md hover:border-[#d76b00] transition cursor-pointer"
          >
            <div className="flex gap-3">
              <div className="h-20 w-20 flex items-center justify-center rounded-lg bg-white overflow-hidden">
                <Image
                  src={company.logo || "/images/logo-default.png"}
                  alt={company.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#263a4d] line-clamp-2">
                  {company.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {company.categories
                    ?.map((item) => item.category.name)
                    .join(" • ")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 text-[#263a4d] px-3 py-1 text-sm flex items-center gap-1">
                <MapPin size={12} />
                {company.province?.name || "Toàn quốc"}
              </span>

              <span className="rounded-full bg-gray-100 text-[#263a4d] px-3 py-1 text-sm flex items-center gap-1">
                <BriefcaseBusiness size={12} />
                {company.openJobCount ?? company._count?.jobs ?? 0} tin đang mở
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setFilter("page", currentPage - 1)}
            disabled={currentPage === 1}
            className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-1/2
    h-14 w-14 flex items-center justify-end pr-2
    rounded-full hover:bg-[#8d660d] hover:text-white
    shadow-md hover:opacity-90
    disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setFilter("page", currentPage + 1)}
            disabled={currentPage === totalPages}
            className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-1/2
    h-14 w-14 flex items-center justify-start pl-2
    rounded-full hover:bg-[#8d660d] hover:text-white
    shadow-md hover:opacity-90
    disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
