import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import FormUpdateProfile from "./FormUpdateProfile";
import ProfileRecommendationsCard from "./ProfileRecommendationsCard";

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Cập nhật thông tin cá nhân và liên hệ.",
};

export default async function ProfilePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f3f5f7] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Tài khoản</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật hồ sơ và thông tin liên hệ
          </p>
        </header>

        <FormUpdateProfile />

        <ProfileRecommendationsCard />

        <Link
          href="/profile/password"
          className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#00b14f]/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/10 text-[#00b14f]">
              <KeyRound className="h-5 w-5" />
            </span>

            <p className="font-semibold text-gray-900">Đổi mật khẩu</p>
          </div>
          <span className="text-sm font-medium text-[#00b14f]">Mở →</span>
        </Link>
      </div>
    </div>
  );
}
