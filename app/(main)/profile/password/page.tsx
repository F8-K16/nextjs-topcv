import type { Metadata } from "next";
import Link from "next/link";
import FormChangePassword from "../FormChangePassword";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
};

export default function ProfilePasswordPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f3f5f7] px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="space-y-2">
          <Link
            href="/profile"
            className="text-sm font-medium text-[#00b14f] hover:underline"
          >
            ← Quay lại tài khoản
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
          <p className="text-sm text-gray-500">
            Nên dùng mật khẩu mạnh và không trùng với các dịch vụ khác.
          </p>
        </header>

        <FormChangePassword />
      </div>
    </div>
  );
}
