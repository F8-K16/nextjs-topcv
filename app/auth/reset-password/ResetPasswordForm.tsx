"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import {
  authFieldClass,
  authFormCardClass,
  authFormFooterTextClass,
  authFormShellClass,
  authLabelClass,
  authOtpFieldClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
  authSecondaryOutlineButtonClass,
} from "@/lib/auth-ui";

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Nhập email để gửi lại mã");
      return;
    }
    setResendLoading(true);
    const res = await authService.resendResetOtp(email.trim());
    setResendLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message || "Đã gửi lại mã");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }
    if (code.length < 1) {
      toast.error("Nhập mã OTP");
      return;
    }
    setLoading(true);
    const res = await authService.resetPassword({
      email: email.trim(),
      code: code.trim(),
      newPassword,
    });
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message || "Đặt lại mật khẩu thành công");
    router.push("/auth/login");
  };

  return (
    <div className={authFormShellClass}>
      <div className={authFormCardClass}>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Đặt lại mật khẩu
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Nhập mã đã gửi tới email và mật khẩu mới của bạn.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className={authLabelClass} htmlFor="reset-email">
              Email <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="email@example.com"
                className={authFieldClass}
              />
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                aria-hidden
              />
            </div>
          </div>

          <div>
            <label className={authLabelClass} htmlFor="reset-otp">
              Mã OTP <span className="text-red-600">*</span>
            </label>
            <input
              id="reset-otp"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="• • • • • •"
              className={`${authOtpFieldClass} mt-1`}
            />
          </div>

          <div>
            <label className={authLabelClass} htmlFor="reset-new-password">
              Mật khẩu mới <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="reset-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự"
                className={`${authFieldClass} pr-11`}
              />
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className={authLabelClass} htmlFor="reset-confirm">
              Nhập lại mật khẩu <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="reset-confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`${authFieldClass} pr-11`}
              />
              <LockKeyhole
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className={authPrimaryButtonClass}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý…
                </span>
              ) : (
                "Xác nhận mật khẩu mới"
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className={authSecondaryOutlineButtonClass}
            >
              {resendLoading ? "Đang gửi…" : "Gửi lại mã OTP"}
            </button>
          </div>
        </form>

        <p className={authFormFooterTextClass}>
          <Link href="/auth/login" className={authSecondaryLinkClass}>
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className={`${authFormShellClass} flex min-h-[280px] items-center justify-center`}>
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
