"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { STALE_EMPLOYER_ME_MS } from "@/lib/query-stale-time";
import { employerPortalService } from "@/services/employer-portal.service";
import EmployerSubnav from "./EmployerSubnav";
import { readEmployerQueryError } from "./employer-query-ui";
import { useAuthStore } from "@/app/stores/auth.store";

const MSG_LOAD = "Đang tải khu vực nhà tuyển dụng…";
const MSG_FALLBACK =
  "Không thể tải thông tin nhà tuyển dụng. Vui lòng thử lại sau.";

export default function EmployerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["employer-portal-me", userId],
    queryFn: () => employerPortalService.me(),
    staleTime: STALE_EMPLOYER_ME_MS,
    enabled: userId != null,
  });

  if (userId == null || isPending) {
    return (
      <div className="employer-app mx-auto w-full max-w-full px-4 py-8 md:px-6 lg:px-10">
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
          {MSG_LOAD}
        </div>
      </div>
    );
  }

  if (isError) {
    const raw = readEmployerQueryError(error);
    const vi =
      raw === "Employer profile not found"
        ? "Chưa có hồ sơ nhà tuyển dụng."
        : raw === "Employer account is not approved yet"
          ? "Tài khoản nhà tuyển dụng chưa được duyệt."
          : raw === "Employer is not linked to a company"
            ? "Tài khoản chưa được gắn với công ty."
            : raw || MSG_FALLBACK;

    return (
      <div className="employer-app mx-auto w-full max-w-full px-4 py-8 md:px-6 lg:px-10">
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100">
          {vi}
        </div>
      </div>
    );
  }

  const companySuspended = data?.company?.status === false;

  return (
    <div className="employer-app mx-auto w-full max-w-full bg-[#f4f6f8] px-4 py-6 md:px-6 lg:px-8 dark:bg-transparent">
      {companySuspended ? (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-amber-300/90 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <p className="font-semibold">Công ty đã ngừng hoạt động</p>
          <p className="mt-1.5 leading-relaxed">
            Tài khoản tuyển dụng của bạn thuộc một công ty đang bị khóa trên hệ
            thống. Bạn không thể cập nhật hồ sơ công ty hay đăng/sửa tin tuyển
            dụng cho đến khi được mở lại. Vui lòng kiểm tra thông báo hệ thống
            hoặc{" "}
            <span className="font-medium">
              liên hệ bộ phận hỗ trợ (email / hotline trên website)
            </span>{" "}
            để biết lý do và các bước tiếp theo.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        <EmployerSubnav
          key={pathname}
          companyName={data?.company?.name}
          companyLogo={data?.company?.logo}
          companyLocked={companySuspended}
        />
        <div className="min-w-0 flex-1 overflow-x-hidden pb-2">{children}</div>
      </div>
    </div>
  );
}
