import type { Metadata } from "next";

import EmployerEditJobPageClient from "./EmployerEditJobPageClient";

export const metadata: Metadata = {
  title: "Chỉnh sửa tin tuyển dụng",
  description: "Cập nhật nội dung và trạng thái tin đăng.",
};

type Props = { params: Promise<{ id: string }> };

export default async function EmployerEditJobPage({ params }: Props) {
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isFinite(jobId) || jobId <= 0) {
    return (
      <p className="text-sm text-red-600">ID không hợp lệ</p>
    );
  }
  return <EmployerEditJobPageClient jobId={jobId} />;
}
