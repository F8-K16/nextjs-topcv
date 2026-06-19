"use client";

import { verifyAction } from "@/app/actions/auth.action";
import { authService } from "@/services/auth.service";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

const RESEND_COOLDOWN_SEC = 60;

export default function VerifyForm({ email }: { email: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleResend = async () => {
    if (!email) {
      toast.error("Thiếu email");
      return;
    }
    if (cooldown > 0) return;
    setResendLoading(true);
    const res = await authService.resendVerification(email);
    setResendLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message || "Đã gửi lại mã xác thực");
    tickCooldown();
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    const res = await verifyAction(email, code);

    if (!res.success) {
      toast.error(res.message);
      setLoading(false);
      return;
    }

    const data = res.data;

    if (data!.needsApproval) {
      toast.success("Xác thực thành công");

      setTimeout(() => {
        window.location.href =
          "/auth/pending-approval?email=" + encodeURIComponent(email);
      }, 1000);

      return;
    }

    setLoading(false);
    toast.success("Xác thực thành công");
    window.location.href = data!.isEmployer ? "/employer" : "/";
  };

  return (
    <div className="space-y-5">
      <label className="block text-sm font-medium text-zinc-700">
        Mã OTP <span className="text-red-600">*</span>
      </label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
        inputMode="numeric"
        placeholder="• • • • • •"
        className="w-full border border-gray-200 px-4 py-3.5 rounded-xl text-center tracking-[0.35em] text-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00b14f] focus:border-[#00b14f]"
      />

      <button
        type="button"
        onClick={handleVerify}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-[#00b14f] hover:bg-[#009944] text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang xác thực...
          </>
        ) : (
          "Xác thực"
        )}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendLoading || cooldown > 0}
        className="w-full h-11 rounded-xl border border-[#00b14f]/40 text-[#00b14f] font-medium hover:bg-[#00b14f]/5 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {resendLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {cooldown > 0
          ? `Gửi lại sau ${cooldown}s`
          : "Gửi lại mã xác thực"}
      </button>
    </div>
  );
}
