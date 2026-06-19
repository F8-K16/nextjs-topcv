import type { Metadata } from "next";
import { Suspense } from "react";

import EmployerApplicationsPageClient from "./EmployerApplicationsPageClient";

export const metadata: Metadata = {
  title: "Ứng viên & hồ sơ",
  description: "Quản lý hồ sơ ứng tuyển vào tin đăng của công ty.",
};

export default function EmployerApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-zinc-500">
          {"Đang tải…"}
        </div>
      }
    >
      <EmployerApplicationsPageClient />
    </Suspense>
  );
}
