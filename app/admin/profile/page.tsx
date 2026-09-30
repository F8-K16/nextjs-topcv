import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import FormUpdateProfile from "@/app/(main)/profile/FormUpdateProfile";

export const metadata: Metadata = {
  title: "Thông tin cá nhân",
  description: "Cập nhật hồ sơ tài khoản quản trị.",
};

export default function AdminProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <AdminPageHeader
        title="Thông tin cá nhân"
        description="Cập nhật hồ sơ tài khoản quản trị. Trang này tách khỏi hồ sơ ứng viên."
      />
      <FormUpdateProfile description="Tên, ảnh đại diện, số điện thoại và email thông báo của tài khoản quản trị." />
      <Link
        href="/admin/profile/password"
        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
            <KeyRound className="h-5 w-5" />
          </span>
          <p className="font-semibold text-zinc-900 dark:text-white">
            Đổi mật khẩu
          </p>
        </div>
        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
          Mở →
        </span>
      </Link>
    </div>
  );
}
