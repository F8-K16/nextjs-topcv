import type { Metadata } from "next";
import { Suspense } from "react";
import AuthMarketingPanel from "../components/AuthMarketingPanel";
import CandidateSignupForm from "./candidate/CandidateSignupForm";

export const metadata: Metadata = {
  title: "Đăng ký ứng viên",
  description: "Tạo tài khoản ứng viên để tìm việc và ứng tuyển trên TopCV.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/80 lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        <Suspense fallback={<div className="text-sm text-zinc-500">Đang tải…</div>}>
          <CandidateSignupForm />
        </Suspense>
      </div>
      <AuthMarketingPanel />
    </div>
  );
}
