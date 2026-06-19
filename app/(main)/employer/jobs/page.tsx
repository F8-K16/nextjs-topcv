import type { Metadata } from "next";
import { Suspense } from "react";

import EmployerJobsPageClient from "./EmployerJobsPageClient";

export const metadata: Metadata = {
  title: "Tin đã đăng",
  description: "Danh sách tin tuyển dụng của doanh nghiệp.",
};

export default function EmployerJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-zinc-500">
          {"Đang tải…"}
        </div>
      }
    >
      <EmployerJobsPageClient />
    </Suspense>
  );
}
