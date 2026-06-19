import type { Metadata } from "next";

import ForgotPasswordForm from "./ForgotPasswordForm";
import AuthMarketingPanel from "../components/AuthMarketingPanel";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Khôi phục mật khẩu qua email đã đăng ký.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/80 lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        <ForgotPasswordForm />
      </div>
      <AuthMarketingPanel />
    </div>
  );
}
