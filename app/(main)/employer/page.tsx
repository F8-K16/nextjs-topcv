import type { Metadata } from "next";

import EmployerDashboardPageClient from "./EmployerDashboardPageClient";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Bảng điều khiển nhà tuyển dụng — tin đăng, ứng viên và thống kê.",
};

export default function EmployerDashboardPage() {
  return <EmployerDashboardPageClient />;
}
