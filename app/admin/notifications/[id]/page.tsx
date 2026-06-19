import type { Metadata } from "next";

import NotificationDetailClient from "@/components/NotificationDetailClient";

export const metadata: Metadata = {
  title: "Chi tiết thông báo",
  description: "Nội dung thông báo (không gian quản trị).",
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminNotificationDetailPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);

  return <NotificationDetailClient id={id} variant="admin" />;
}
