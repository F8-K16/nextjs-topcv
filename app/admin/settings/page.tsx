import type { Metadata } from "next";

import AdminSettingsPageClient from "./AdminSettingsPageClient";

export const metadata: Metadata = {
  title: "Cài đặt",
  description: "Tham số và cấu hình chung của nền tảng.",
};

export default function AdminSettingsPage() {
  return <AdminSettingsPageClient />;
}
