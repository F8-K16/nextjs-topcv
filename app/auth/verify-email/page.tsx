import type { Metadata } from "next";

import VerifyForm from "./VerifyForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Xác minh email",
  description: "Xác nhận địa chỉ email để kích hoạt tài khoản.",
};

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams;
  const safeEmail = email || "";

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-2/3 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Xác thực email
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
            Mã gồm 6 chữ số đã được gửi tới
            <br />
            {safeEmail ? (
              <span className="font-semibold text-[#00b14f]">{safeEmail}</span>
            ) : (
              <span className="text-amber-600">(thiếu tham số email)</span>
            )}
          </p>

          {safeEmail ? (
            <div className="mt-8">
              <VerifyForm email={safeEmail} />
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-gray-600">
              Vui lòng{" "}
              <Link href="/auth/sign-up" className="text-[#00b14f] font-medium">
                đăng ký lại
              </Link>{" "}
              hoặc kiểm tra liên kết trong email.
            </p>
          )}

          <p className="mt-8 text-center text-sm text-gray-400">
            <Link href="/auth/login" className="text-[#00b14f] hover:underline">
              Đã có tài khoản? Đăng nhập
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/3 bg-linear-to-br from-[#00b14f] to-teal-900 text-white items-center justify-center">
        <div className="max-w-sm text-center px-6">
          <h2 className="text-2xl font-bold mb-3">Gần xong rồi</h2>
          <p className="text-white/85 text-sm leading-relaxed">
            Xác thực email giúp bảo vệ tài khoản và nhận thông báo từ nhà tuyển
            dụng.
          </p>
        </div>
      </div>
    </div>
  );
}
