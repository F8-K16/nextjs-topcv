"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import {
  authFieldClass,
  authFormCardClass,
  authFormFooterTextClass,
  authFormShellClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/lib/auth-ui";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    const res = await authService.forgotPassword(email.trim());
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message || "Đã gửi mã đến email của bạn");
    router.push(
      `/auth/reset-password?email=${encodeURIComponent(email.trim())}`,
    );
  };

  return (
    <div className={authFormShellClass}>
      <div className={authFormCardClass}>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Quên mật khẩu
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className={authLabelClass} htmlFor="forgot-email">
              Email <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="forgot-email"
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

          <button
            type="submit"
            disabled={loading}
            className={authPrimaryButtonClass}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi…
              </span>
            ) : (
              "Gửi mã xác thực"
            )}
          </button>
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
