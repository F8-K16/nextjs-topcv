"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { adminBlogService } from "@/services/admin-blog.service";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import AdminPagination from "@/components/admin/AdminPagination";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_PAGE_STACK,
  ADMIN_SEARCH_ICON,
  ADMIN_SEARCH_WRAP,
  adminSearchFieldWithIcon9,
  adminSurfaceCardBlur,
  adminTable,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import {
  AdminPageHeader,
  AdminToolbar,
  AdminToolbarRow,
} from "@/components/admin/admin-page-header";
import { STALE_ADMIN_BLOG_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";
import { formatDate } from "@/utils/helper";

export function BlogAdminInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const params = new URLSearchParams({
    page: String(page),
    limit: "12",
    search,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "blog", page, search],
    queryFn: () => adminBlogService.list(params),
    staleTime: STALE_ADMIN_BLOG_MS,
  });

  const pushQuery = (next: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === "") p.delete(k);
      else p.set(k, v);
    });
    router.push(`?${p.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6">
        <p>Không tải được blog.</p>
        <button type="button" onClick={() => refetch()} className="mt-3 text-sm underline">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={ADMIN_PAGE_STACK}>
      <AdminConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Xóa bài viết?"
        description="Bài sẽ ẩn khỏi trang blog công khai."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={async () => {
          if (!deleteId) return;
          setDeleteLoading(true);
          try {
            await adminBlogService.remove(deleteId);
            toast.success("Đã xóa");
            setDeleteId(null);
            qc.invalidateQueries({ queryKey: ["admin", "blog"] });
          } catch (e) {
            toast.error(getErrorToastMessage(e) || "Không xóa được");
          } finally {
            setDeleteLoading(false);
          }
        }}
      />

      <AdminPageHeader
        title="Blog"
        description="CMS bài viết cẩm nang nghề nghiệp trên trang /blog."
        actions={
          <Link href="/admin/blog/new" className={ADMIN_ADD_NEW_BUTTON}>
            <Plus className="h-3.5 w-3.5" />
            Bài mới
          </Link>
        }
      />

      <AdminToolbar>
        <AdminToolbarRow>
          <div className={ADMIN_SEARCH_WRAP}>
            <Search className={ADMIN_SEARCH_ICON} />
            <input
              defaultValue={search}
              placeholder="Tìm tiêu đề..."
              className={adminSearchFieldWithIcon9}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushQuery({
                    search: (e.target as HTMLInputElement).value,
                    page: "1",
                  });
                }
              }}
            />
          </div>
        </AdminToolbarRow>
      </AdminToolbar>

      <div className={cn(adminSurfaceCardBlur, "overflow-hidden p-0")}>
        <table className={cn(adminTable, adminTableDivide)}>
          <thead>
            <tr className={cn(adminTableHeadRow, "uppercase tracking-wide")}>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className={adminTableDivide}>
            {data.posts.map((p) => (
              <tr key={p.id} className="text-zinc-800 dark:text-zinc-200">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900 dark:text-white">{p.title}</p>
                  <p className="text-[11px] text-zinc-500">/{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {p.publishedAt ? (
                    <span className="text-emerald-700">Công khai</span>
                  ) : (
                    <span className="text-amber-700">Nháp</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600">{formatDate(p.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      className="rounded-lg border border-zinc-200 p-2 text-rose-700 hover:bg-rose-50"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminPagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(p) => pushQuery({ page: String(p) })}
        />
      </div>
    </div>
  );
}
