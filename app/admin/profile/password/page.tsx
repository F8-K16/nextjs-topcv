import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import FormChangePassword from "@/app/(main)/profile/FormChangePassword";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
};

export default function AdminProfilePasswordPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href="/admin/profile"
        className="text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
      >
        ← Quay lại thông tin cá nhân
      </Link>
      <AdminPageHeader
        title="Đổi mật khẩu"
        description="Mật khẩu tài khoản quản trị, tách khỏi trang hồ sơ ứng viên."
      />
      <FormChangePassword />
    </div>
  );
}
