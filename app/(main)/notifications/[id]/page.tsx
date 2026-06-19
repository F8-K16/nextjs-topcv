import type { Metadata } from "next";

import NotificationDetailClient from "@/components/NotificationDetailClient";

export const metadata: Metadata = {
  title: "Chi tiết thông báo",
};

type Props = { params: Promise<{ id: string }> };

export default async function NotificationDetailPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);

  return <NotificationDetailClient id={id} variant="main" />;
}
