import type { Metadata } from "next";

import LoginForm from "./LoginForm";
import AuthMarketingPanel from "../components/AuthMarketingPanel";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản TopCV để ứng tuyển hoặc quản lý tuyển dụng.",
};

type Props = {
  searchParams: Promise<{
    redirect?: string;
    code?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { redirect, code, error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100/80 lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
        <LoginForm
          redirect={redirect}
          oauthCode={typeof code === "string" ? code : undefined}
          oauthError={typeof error === "string" ? error : undefined}
        />
      </div>
      <AuthMarketingPanel />
    </div>
  );
}
