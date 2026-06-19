"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { Loader2, RefreshCw, Clock } from "lucide-react";

const RESEND_COOLDOWN_SEC = 60;

function PendingApprovalInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const tickCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SEC);
    const id = window.setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error("Không tìm thấy email trên URL. Hãy đăng nhập sau khi được duyệt.");
      return;
    }
    if (cooldown > 0) return;
    setResendLoading(true);
    const res = await authService.resendVerification(email.trim());
    setResendLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message || "Đã gửi lại mã (nếu email chưa được xác thực)");
    tickCooldown();
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 p-8 md:p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Clock className="h-8 w-8" strokeWidth={1.75} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Tài khoản đang chờ duyệt
      </h1>

      <p className="text-gray-600 text-sm leading-relaxed">
        Tài khoản nhà tuyển dụng đã được tạo và đang chờ quản trị viên phê duyệt.
        Bạn sẽ nhận email khi được kích hoạt.
      </p>

      {email ? (
        <p className="mt-4 text-xs text-gray-500 break-all">
          Email: <span className="font-medium text-gray-700">{email}</span>
        </p>
      ) : null}

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={resendLoading || cooldown > 0 || !email}
          className="w-full h-11 rounded-xl border border-[#00b14f]/50 text-[#00b14f] text-sm font-semibold hover:bg-[#00b14f]/5 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {resendLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {cooldown > 0
            ? `Gửi lại mã sau ${cooldown}s`
            : "Gửi lại mã xác thực email"}
        </button>
        <p className="text-xs text-gray-400 leading-relaxed">
          Dùng nếu bạn vẫn đang bước xác thực email và chưa nhận được mã. Nếu
          email đã xác thực, hệ thống sẽ báo tương ứng.
        </p>

        <Link
          href="/"
          className="inline-flex w-full h-11 items-center justify-center rounded-xl bg-[#00b14f] text-white text-sm font-semibold hover:bg-[#009944] transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function PendingApprovalClient() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
        </div>
      }
    >
      <PendingApprovalInner />
    </Suspense>
  );
}
