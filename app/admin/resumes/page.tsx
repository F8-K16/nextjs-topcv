import { fetchWrapper } from "@/utils/fetch";
import ResumesTable from "./ResumesTable";
import { ResumePageResponse } from "@/app/types/resume.type";
import { API_BASE_URL } from "@/lib/api-base-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV ứng viên",
  description: "Danh sách CV và trạng thái trên hệ thống.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

export default async function ResumesPage({ searchParams }: Props) {
  const params = await searchParams;

  const query = new URLSearchParams({
    page: params.page || "1",
    search: params.search || "",
  });

  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/resumes?${query}`,
  );

  const data: ResumePageResponse = await res.json();

  return (
    <div className="space-y-4">
      <ResumesTable data={data} />
    </div>
  );
}
