import type { Metadata } from "next";
import Link from "next/link";

import FormChangePassword from "@/app/(main)/profile/FormChangePassword";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
};

export default function EmployerProfilePasswordPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href="/employer/profile"
        className="text-sm font-medium text-[#00b14f] hover:underline"
      >
        ← Quay lại thông tin cá nhân
      </Link>
      <header>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Đổi mật khẩu
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Mật khẩu tài khoản nhà tuyển dụng.
        </p>
      </header>
      <FormChangePassword />
    </div>
  );
}
