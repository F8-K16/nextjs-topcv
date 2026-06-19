"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { employerPortalService } from "@/services/employer-portal.service";
import {
  EmployerQueryError,
  EmployerQueryLoading,
} from "../employer-query-ui";
import { getErrorToastMessage } from "@/lib/submit-error";
import {
  GC_EMPLOYER_COMPANY_MEMBERS_MS,
  STALE_EMPLOYER_COMPANY_MEMBERS_MS,
  STALE_EMPLOYER_ME_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";

export default function EmployerMembersPageClient() {
  const userId = useAuthStore((s) => s.user?.id);
  const [email, setEmail] = useState("");

  const { isPending: mePending } = useQuery({
    queryKey: ["employer-portal-me", userId],
    queryFn: () => employerPortalService.me(),
    staleTime: STALE_EMPLOYER_ME_MS,
    enabled: userId != null,
  });

  const {
    data: members,
    isPending: membersPending,
    isError: membersError,
    error: membersErr,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["employer-portal-company-members", userId],
    queryFn: () => employerPortalService.listCompanyMembers(),
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_COMPANY_MEMBERS_MS,
    gcTime: GC_EMPLOYER_COMPANY_MEMBERS_MS,
  });

  const createMut = useMutation({
    mutationFn: (vars: { email: string }) =>
      employerPortalService.createEmployerInvite(vars),
    onSuccess: async (data, vars) => {
      if (data.emailSent) {
        toast.success(`Đã gửi email mời tới ${vars.email}`);
      } else {
        toast.warning(
          "Không thể xếp hàng gửi email. Hãy gửi liên kết hoặc mã mời thủ công cho đồng nghiệp.",
        );
      }
      setEmail("");
      if (!data.emailSent) {
        const manual = `${data.inviteUrl}\nMã: ${data.token}`;
        try {
          await navigator.clipboard.writeText(manual);
          toast.message("Đã sao chép liên kết và mã mời vào clipboard");
        } catch {
          toast.message(manual, { duration: 14_000 });
        }
      }
    },
    onError: (e: unknown) => {
      toast.error(getErrorToastMessage(e) || "Không tạo được lời mời");
    },
  });

  if (userId == null || mePending || membersPending) {
    return <EmployerQueryLoading />;
  }

  if (membersError) {
    return (
      <EmployerQueryError
        error={membersErr}
        onRetry={() => void refetchMembers()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Mời thành viên</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Hệ thống gửi email mời tới địa chỉ bạn nhập. Người nhận đăng ký bằng
          đúng email đó và không cần nhập lại thông tin công ty. Mã trong email
          có hiệu lực một giờ. Nếu gửi email lỗi, bạn vẫn có thể sao chép liên
          kết và mã từ thông báo.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Tài khoản nhà tuyển dụng cùng công ty
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Danh sách tài khoản đã duyệt, đang dùng chung hồ sơ công ty với bạn.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Tên hiển thị</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Số điện thoại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {!members?.length ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Chưa có thành viên
                  </td>
                </tr>
              ) : (
                members.map((row) => (
                  <tr key={row.employerId} className="hover:bg-zinc-50/80">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {row.username}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {row.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-600">
                      {row.phone ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">
          Gửi lời mời qua email
        </h2>
        <form
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const em = email.trim();
            if (!em) {
              toast.error("Nhập email người nhận");
              return;
            }
            createMut.mutate({ email: em });
          }}
        >
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Email người được mời
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              placeholder="colleague@company.com"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {createMut.isPending ? "Đang gửi…" : "Gửi lời mời"}
          </button>
        </form>
      </div>
    </div>
  );
}
