import type { Metadata } from "next";
import { Suspense } from "react";
import AuthMarketingPanel from "../../components/AuthMarketingPanel";
import EmployerSignupForm from "./EmployerSignupForm";

export const metadata: Metadata = {
  title: "Đăng ký nhà tuyển dụng",
  description: "Tạo tài khoản nhà tuyển dụng để đăng tin và quản lý ứng viên trên TopCV.",
};

export default function EmployerSignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/80 lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        <Suspense fallback={<div className="text-sm text-zinc-500">Đang tải…</div>}>
          <EmployerSignupForm />
        </Suspense>
      </div>
      <AuthMarketingPanel />
    </div>
  );
}
