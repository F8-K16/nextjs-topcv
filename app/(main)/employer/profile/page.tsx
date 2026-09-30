import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import FormUpdateProfile from "@/app/(main)/profile/FormUpdateProfile";

export const metadata: Metadata = {
  title: "Thông tin cá nhân",
  description: "Cập nhật hồ sơ tài khoản nhà tuyển dụng.",
};

export default function EmployerProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
          Thông tin cá nhân
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
          Cập nhật hồ sơ tài khoản nhà tuyển dụng. Trang này tách khỏi hồ sơ
          ứng viên.
        </p>
      </div>
      <FormUpdateProfile description="Tên, ảnh đại diện, số điện thoại và email thông báo của tài khoản nhà tuyển dụng." />
      <Link
        href="/employer/profile/password"
        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#00b14f]/40"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/10 text-[#00b14f]">
            <KeyRound className="h-5 w-5" />
          </span>
          <p className="font-semibold text-zinc-900">Đổi mật khẩu</p>
        </div>
        <span className="text-sm font-medium text-[#00b14f]">Mở →</span>
      </Link>
    </div>
  );
}
