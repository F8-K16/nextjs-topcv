import { fetchWrapper } from "@/utils/fetch";
import CompaniesTable from "./CompaniesTable";
import { API_BASE_URL } from "@/lib/api-base-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Công ty",
  description: "Quản lý hồ sơ doanh nghiệp và trạng thái xác minh.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    categoryId?: string;
    provinceId?: string;
    districtId?: string;
  }>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const params = await searchParams;

  const query = new URLSearchParams({
    page: params.page || "1",
    search: params.search || "",
    status: params.status || "",
    categoryId: params.categoryId || "",
    provinceId: params.provinceId || "",
    districtId: params.districtId || "",
  });

  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/companies?${query}`,
  );

  const data = await res.json();

  return (
    <div className="space-y-4">
      <CompaniesTable data={data} />
    </div>
  );
}
