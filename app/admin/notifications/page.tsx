import type { Metadata } from "next";

import AdminNotificationsPageClient from "./AdminNotificationsPageClient";

export const metadata: Metadata = {
  title: "Thông báo",
  description: "Thông báo gửi tới người dùng và chiến dịch.",
};

export default function AdminNotificationsPage() {
  return <AdminNotificationsPageClient />;
}
