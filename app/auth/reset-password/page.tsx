import type { Metadata } from "next";

import ResetPasswordForm from "./ResetPasswordForm";
import AuthMarketingPanel from "../components/AuthMarketingPanel";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Thiết lập mật khẩu mới từ liên kết đã gửi qua email.",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/80 lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        <ResetPasswordForm />
      </div>
      <AuthMarketingPanel />
    </div>
  );
}
