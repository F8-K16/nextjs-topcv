import { fetchWrapper } from "@/utils/fetch";
import AuditLogsTable from "./AuditLogsTable";
import { AuditLogListResponse } from "@/app/types/audit-log.type";
import { API_BASE_URL } from "@/lib/api-base-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhật ký hệ thống",
  description: "Theo dõi thao tác và sự kiện trong hệ thống.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    action?: string;
    actorUserId?: string;
    entityType?: string;
    entityId?: string;
    success?: string;
  }>;
};

export default async function AuditLogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = new URLSearchParams({
    page: params.page || "1",
    action: params.action || "",
    actorUserId: params.actorUserId || "",
    entityType: params.entityType || "",
    entityId: params.entityId || "",
    success: params.success || "",
  });

  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/audit-logs?${query}`,
  );
  const data = (await res.json()) as AuditLogListResponse;

  return <AuditLogsTable data={data} />;
}

