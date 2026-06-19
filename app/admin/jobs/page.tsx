import { fetchWrapper } from "@/utils/fetch";
import JobsTable from "./JobTable";
import { JobsResponse } from "@/app/types/job.type";
import { API_BASE_URL } from "@/lib/api-base-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tin tuyển dụng",
  description: "Duyệt và quản lý tin đăng trên nền tảng.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    jobType?: string;
    companyId?: string;
    categoryId?: string;
    experienceLevel?: string;
    salaryRange?: string;
    moderationStatus?: string;
    lifecycle?: string;
    isFeatured?: string;
  }>;
};

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;

  const query = new URLSearchParams({
    page: params.page || "1",
    search: params.search || "",
    jobType: params.jobType || "",
    companyId: params.companyId || "",
    categoryId: params.categoryId || "",
    experienceLevel: params.experienceLevel || "",
    salaryRange: params.salaryRange || "",
    moderationStatus: params.moderationStatus || "",
    lifecycle: params.lifecycle || "",
    isFeatured: params.isFeatured || "",
  });

  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/jobs?${query.toString()}`,
  );

  const data: JobsResponse = await res.json();

  return (
    <div className="space-y-4">
      <JobsTable data={data} />
    </div>
  );
}
