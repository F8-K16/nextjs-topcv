"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import EmployerJobForm from "../../components/EmployerJobForm";
import { employerPortalService } from "@/services/employer-portal.service";
import {
  EmployerQueryError,
  EmployerQueryLoading,
} from "../../employer-query-ui";
import { STALE_EMPLOYER_FORM_META_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";

const MSG_REDIRECT =
  "Vui lòng cập nhật thông tin công ty và chọn ít nhất một danh mục ngành trước khi đăng tin.";
const MSG_LOAD = "Đang tải…";

export default function EmployerNewJobPageClient() {
  const router = useRouter();
  const didRedirect = useRef(false);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: meta, isPending, isError, error, refetch, isSuccess } =
    useQuery({
      queryKey: ["employer-form-meta", userId],
      queryFn: () => employerPortalService.formMeta(),
      enabled: userId != null,
      staleTime: STALE_EMPLOYER_FORM_META_MS,
    });

  useEffect(() => {
    if (!isSuccess || !meta || didRedirect.current) return;
    if (meta.categories.length === 0) {
      didRedirect.current = true;
      toast.info(MSG_REDIRECT);
      router.replace("/employer/company?from=jobs-new");
    }
  }, [isSuccess, meta, router]);

  if (userId == null || isPending) {
    return <EmployerQueryLoading label={MSG_LOAD} />;
  }

  if (isError || !meta) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  if (meta.categories.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        {"Đang chuyển hướng…"}
      </div>
    );
  }

  if (meta.company.status === false) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-8 text-center text-sm text-amber-950">
        <p className="font-semibold">Không thể đăng tin mới</p>
        <p className="mt-2 leading-relaxed">
          Công ty đang bị khóa hoạt động. Bạn không thể tạo tin tuyển dụng mới
          cho đến khi được mở lại. Vui lòng xem dòng thông báo ở đầu trang khu
          vực nhà tuyển dụng hoặc liên hệ bộ phận hỗ trợ qua email / hotline
          trên website để biết chi tiết.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">
        {"Đăng tin tuyển dụng mới"}
      </h1>
      <EmployerJobForm mode="create" />
    </div>
  );
}
