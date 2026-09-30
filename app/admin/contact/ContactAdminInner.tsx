"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { adminContactService } from "@/services/admin-contact.service";
import AdminPagination from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_STACK,
  adminSurfaceCardBlur,
  adminTable,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { STALE_ADMIN_CONTACT_MS } from "@/lib/query-stale-time";
import { formatDate } from "@/utils/helper";
import { cn } from "@/lib/utils";

export function ContactAdminInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const params = new URLSearchParams({ page: String(page), limit: "20" });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "contact", page],
    queryFn: () => adminContactService.list(params),
    staleTime: STALE_ADMIN_CONTACT_MS,
  });

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />;
  }
  if (isError || !data) {
    return (
      <div>
        <p>Không tải được hộp thư liên hệ.</p>
        <button type="button" className="mt-2 underline" onClick={() => refetch()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={ADMIN_PAGE_STACK}>
      <AdminPageHeader
        title="Liên hệ"
        description="Tin nhắn từ form /contact. Mỗi lượt gửi cũng tạo email tới hộp thư hỗ trợ."
      />
      <div className={cn(adminSurfaceCardBlur, "overflow-x-auto p-0")}>
        <table className={cn(adminTable, adminTableDivide)}>
          <thead>
            <tr className={cn(adminTableHeadRow, "uppercase")}>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người gửi</th>
              <th className="px-4 py-3">Chủ đề</th>
              <th className="px-4 py-3">Nội dung</th>
            </tr>
          </thead>
          <tbody className={adminTableDivide}>
            {data.messages.map((m) => (
              <tr key={m.id} className="align-top text-zinc-800 dark:text-zinc-200">
                <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                  {formatDate(m.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{m.name}</p>
                  <a className="text-[11px] text-violet-700" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                </td>
                <td className="px-4 py-3">{m.subject}</td>
                <td className="max-w-md px-4 py-3 whitespace-pre-wrap text-zinc-600">
                  {m.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(p) => router.push(`?page=${p}`)}
        />
      </div>
    </div>
  );
}
