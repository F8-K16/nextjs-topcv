import type { Metadata } from "next";

import NotificationsClient from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Thông báo",
  description: "Thông báo hệ thống và cập nhật liên quan đến tài khoản.",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
