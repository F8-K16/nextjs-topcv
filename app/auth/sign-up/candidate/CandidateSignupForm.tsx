"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail, Phone, User } from "lucide-react";

import { authService } from "@/services/auth.service";
import {
  CandidateSignupFormData,
  candidateSignupSchema,
} from "@/app/validations/auth.schema";
import {
  authFieldClass,
  authFormCardClass,
  authFormFooterTextClass,
  authFormShellClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/lib/auth-ui";
import AuthSocialSection from "../../components/AuthSocialSection";
import AuthBackHome from "../../components/AuthBackHome";
import { API_BASE_URL } from "@/lib/api-base-url";
import { useModalStore } from "@/app/stores/modal.store";

export default function CandidateSignupForm({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const router = useRouter();
  const apiBase = API_BASE_URL?.replace(/\/$/, "") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CandidateSignupFormData>({
    resolver: zodResolver(candidateSignupSchema),
    defaultValues: {
      roles: ["CANDIDATE"],
      agree: false,
    },
  });

  const onSubmit = async (data: CandidateSignupFormData) => {
    const res = await authService.requestRegister({
      ...data,
      roles: ["CANDIDATE"],
    });

    if (!res.success) {
      if (res.errors) {
        Object.entries(res.errors).forEach(([field, message]) => {
          setError(field as keyof CandidateSignupFormData, {
            type: "server",
            message,
          });
        });
        return;
      }
      toast.error(res.message || "Đăng ký thất bại");
      return;
    }

    if (embedded) useModalStore.getState().closeModal();
    router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <div className={embedded ? "" : authFormShellClass}>
      <div className={embedded ? "" : authFormCardClass}>
        {embedded ? null : (
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <AuthBackHome className="mb-0" />
            <Link
              href="/auth/sign-up/employer"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-primary"
            >
              Đăng ký nhà tuyển dụng
            </Link>
          </div>
        )}

        {embedded ? (
          <p className="mb-4 text-sm text-zinc-600">
            Tạo tài khoản ứng viên để tìm việc và ứng tuyển.
          </p>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Đăng ký ứng viên
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Điền thông tin để tạo tài khoản. Bạn có thể bổ sung hồ sơ sau khi
              xác thực email.
            </p>
          </>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={embedded ? "space-y-4" : "mt-7 space-y-5"}
        >
          {/* Tên */}
          <div>
            <label className={authLabelClass} htmlFor="c-username">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="c-username"
                placeholder="Nguyễn Văn A"
                {...register("username")}
                className={authFieldClass}
              />
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            </div>
            {errors.username && (
              <p className="mt-1.5 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={authLabelClass} htmlFor="c-email">
              Email <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="c-email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
                className={authFieldClass}
              />
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* SĐT */}
          <div>
            <label className={authLabelClass} htmlFor="c-phone">
              Số điện thoại <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="c-phone"
                placeholder="0xxxxxxxxx"
                {...register("phone")}
                className={authFieldClass}
              />
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className={authLabelClass} htmlFor="c-password">
              Mật khẩu <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="c-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`${authFieldClass} pr-11`}
              />
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <label className={authLabelClass} htmlFor="c-confirm">
              Xác nhận mật khẩu <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="c-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={`${authFieldClass} pr-11`}
              />
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Điều khoản */}
          <div className="flex items-start gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              {...register("agree")}
              className="mt-1 rounded border-zinc-300 text-primary focus:ring-primary"
            />
            <label>
              Tôi đã đọc và đồng ý với{" "}
              <span className="cursor-pointer font-medium text-primary">Điều khoản dịch vụ</span>{" "}
              và{" "}
              <span className="cursor-pointer font-medium text-primary">Chính sách bảo mật</span>
            </label>
          </div>
          {errors.agree && (
            <p className="text-sm text-red-600">{errors.agree.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !watch("agree")}
            className={authPrimaryButtonClass}
          >
            {isSubmitting ? "Đang gửi…" : "Tạo tài khoản ứng viên"}
          </button>
        </form>

        <AuthSocialSection
          googleAuthHref={apiBase ? `${apiBase}/auth/google` : undefined}
        />

        <p className={authFormFooterTextClass}>
          Đã có tài khoản?{" "}
          {embedded ? (
            <button
              type="button"
              onClick={() => useModalStore.getState().openModal("login")}
              className={authSecondaryLinkClass}
            >
              Đăng nhập
            </button>
          ) : (
            <Link href="/auth/login" className={authSecondaryLinkClass}>
              Đăng nhập
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
