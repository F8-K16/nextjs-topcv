import type { Metadata } from "next";

import EmployerNewJobPageClient from "./EmployerNewJobPageClient";

export const metadata: Metadata = {
  title: "Đăng tin tuyển dụng",
  description: "Tạo tin tuyển dụng mới cho doanh nghiệp.",
};

export default function EmployerNewJobPage() {
  return <EmployerNewJobPageClient />;
}
