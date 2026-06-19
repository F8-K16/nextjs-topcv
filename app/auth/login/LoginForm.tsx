"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  LoginState,
  getCurrentUser,
  loginAction,
  removeToken,
  saveToken,
} from "../../actions/auth.action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  authFieldClass,
  authFormCardClass,
  authFormFooterTextClass,
  authFormShellClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/lib/auth-ui";
import AuthSocialSection from "../components/AuthSocialSection";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/app/stores/auth.store";
import { API_BASE_URL } from "@/lib/api-base-url";

const initialState: LoginState = {};

function getSafeRedirectPath(raw: string | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes(":")) return null;
  return t;
}

function buildLoginPath(redirect?: string) {
  const p = new URLSearchParams();
  if (redirect) p.set("redirect", redirect);
  const s = p.toString();
  return s ? `/auth/login?${s}` : "/auth/login";
}

export default function LoginForm({
  redirect,
  oauthCode,
  oauthError,
}: {
  redirect?: string;
  oauthCode?: string;
  oauthError?: string;
}) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleOauthView, setShowGoogleOauthView] = useState(() =>
    Boolean(oauthCode),
  );
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const oauthErrorHandled = useRef(false);
  const oauthCodeHandled = useRef(false);
  const apiBase = API_BASE_URL?.replace(/\/$/, "") ?? "";

  useEffect(() => {
    if (!oauthError || oauthErrorHandled.current) return;
    oauthErrorHandled.current = true;
    const msg =
      oauthError === "oauth_invalid_state"
        ? "Phiên đăng nhập không hợp lệ (state). Hãy thử Đăng nhập với Google lại."
        : oauthError.startsWith("oauth_")
          ? `Đăng nhập Google: ${decodeURIComponent(
              oauthError.replace(/^oauth_/, "").replace(/\+/g, " "),
            )}`
          : decodeURIComponent(oauthError.replace(/\+/g, " "));
    toast.error(msg);
    router.replace(buildLoginPath(redirect));
  }, [oauthError, redirect, router]);

  useEffect(() => {
    if (!oauthCode || oauthCodeHandled.current) return;
    oauthCodeHandled.current = true;

    const run = async () => {
      const res = await authService.requestGoogleLogin(oauthCode);
      if (!res.success || !res.data) {
        setShowGoogleOauthView(false);
        await removeToken();
        clearAuth();
        toast.error(res.message || "Đăng nhập Google thất bại");
        router.replace(buildLoginPath(redirect));
        return;
      }

      const { accessToken, refreshToken, user } = res.data;
      try {
        await saveToken({ accessToken, refreshToken });
      } catch {
        setShowGoogleOauthView(false);
        await removeToken();
        clearAuth();
        toast.error("Không thể lưu phiên đăng nhập");
        router.replace(buildLoginPath(redirect));
        return;
      }

      const fromQuery = getSafeRedirectPath(redirect);
      const nextUrl = fromQuery
        ? fromQuery
        : user.roles?.some((r: string) =>
              ["ADMIN", "MODERATOR", "SUPPORT"].includes(r),
            )
          ? "/admin"
          : user.roles?.includes("EMPLOYER")
            ? "/employer"
            : "/";

      window.location.replace(nextUrl);
    };

    void run();
  }, [clearAuth, oauthCode, redirect, router]);

  useEffect(() => {
    const handleLoginRedirect = async () => {
      if (!state.success) return;

      const res = await getCurrentUser();
      if (!res) {
        toast.error(
          "Đăng nhập thành công nhưng chưa thể lấy phiên người dùng. Vui lòng tải lại trang hoặc đăng nhập lại.",
        );
        return;
      }
      const user = res!.data;

      const fromQuery = getSafeRedirectPath(redirect);
      if (fromQuery) {
        window.location.href = fromQuery;
        return;
      }

      if (
        user.roles?.some((r: string) =>
          ["ADMIN", "MODERATOR", "SUPPORT"].includes(r),
        )
      ) {
        window.location.href = "/admin";
      } else if (user.roles?.includes("EMPLOYER")) {
        window.location.href = "/employer";
      } else {
        window.location.href = "/";
      }
    };
    handleLoginRedirect();
  }, [state.success, router, redirect]);

  if (showGoogleOauthView) {
    return (
      <div className={authFormShellClass}>
        <div className={authFormCardClass}>
          <div
            className="flex min-h-50 flex-col items-center justify-center gap-3 py-6"
            role="status"
            aria-live="polite"
            aria-label="Đang xử lý đăng nhập Google"
          >
            <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary" />
            <p className="text-center text-sm text-zinc-600">
              Đang hoàn tất đăng nhập Google…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={authFormShellClass}>
      <div className={authFormCardClass}>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Đăng nhập
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Chào mừng bạn quay lại. Đăng nhập để quản lý hồ sơ và ứng tuyển.
        </p>

        <form action={action} className="mt-8 space-y-5">
          <div>
            <label className={authLabelClass} htmlFor="login-email">
              Email <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="login-email"
                type="text"
                name="email"
                autoComplete="email"
                placeholder="email@example.com"
                className={authFieldClass}
              />
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                aria-hidden
              />
            </div>
            {state.fieldErrors?.email && (
              <p className="mt-1.5 text-sm text-red-600">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label className={authLabelClass} htmlFor="login-password">
              Mật khẩu <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
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
            {state.fieldErrors?.password && (
              <p className="mt-1.5 text-sm text-red-600">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          {state.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className={authSecondaryLinkClass}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className={authPrimaryButtonClass}
          >
            {pending ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <AuthSocialSection
          googleAuthHref={apiBase ? `${apiBase}/auth/google` : undefined}
        />

        <p className={authFormFooterTextClass}>
          Chưa có tài khoản?{" "}
          <Link href="/auth/sign-up" className={authSecondaryLinkClass}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
