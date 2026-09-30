import type { Metadata } from "next";

import EmployerAnalyticsPageClient from "./EmployerAnalyticsPageClient";

export const metadata: Metadata = {
  title: "Phân tích tin",
  description:
    "Tỉ lệ xem → ứng tuyển và nguồn traffic theo từng tin tuyển dụng.",
};

export default function EmployerAnalyticsPage() {
  return <EmployerAnalyticsPageClient />;
}
