import type { Metadata } from "next";

import DashboardOverview from "@/components/admin/dashboard-overview";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Thống kê và truy cập nhanh các mục quản trị.",
};

export default function AdminHomePage() {
  return <DashboardOverview />;
}
