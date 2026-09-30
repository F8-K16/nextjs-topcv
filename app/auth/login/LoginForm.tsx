"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  LoginState,
  loginAction,
  removeToken,
  saveToken,
  verifyTwoFactorAction,
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
  authOtpFieldClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/lib/auth-ui";
import AuthSocialSection from "../components/AuthSocialSection";
import AuthBackHome from "../components/AuthBackHome";
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

function destinationForRoles(
  roles: string[],
  redirect?: string,
  setupRequired?: boolean,
) {
  if (setupRequired && roles.includes("ADMIN")) return "/admin/security";
  const fromQuery = getSafeRedirectPath(redirect);
  if (fromQuery) return fromQuery;
  if (roles.some((r) => ["ADMIN", "MODERATOR", "SUPPORT"].includes(r))) {
    return "/admin";
  }
  if (roles.includes("EMPLOYER")) return "/employer";
  return "/";
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
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpPending, setOtpPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (res.data.twoFactorRequired && res.data.challengeToken) {
        setChallengeToken(res.data.challengeToken);
        setShowGoogleOauthView(false);
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

      window.location.replace(
        destinationForRoles(
          user.roles ?? [],
          redirect,
          Boolean(res.data.twoFactorSetupRequired),
        ),
      );
    };

    void run();
  }, [clearAuth, oauthCode, redirect, router]);

  useEffect(() => {
    if (state.twoFactorRequired && state.challengeToken) {
      setChallengeToken(state.challengeToken);
      return;
    }
    if (!state.success) return;
    window.location.replace(
      destinationForRoles(
        state.roles ?? [],
        redirect,
        state.twoFactorSetupRequired,
      ),
    );
  }, [
    state.success,
    state.roles,
    state.twoFactorRequired,
    state.challengeToken,
    state.twoFactorSetupRequired,
    redirect,
  ]);

  const submitOtp = async () => {
    if (!challengeToken) return;
    setOtpPending(true);
    const result = await verifyTwoFactorAction({
      challengeToken,
      code: otp.trim(),
    });
    setOtpPending(false);
    if (!result.success) {
      toast.error(result.error || "Mã xác thực không đúng");
      return;
    }
    window.location.replace(destinationForRoles(result.roles ?? [], redirect));
  };

  if (challengeToken) {
    return (
      <div className={authFormShellClass}>
        <div className={authFormCardClass}>
          <AuthBackHome />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Xác thực hai lớp
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Nhập mã 6 số từ ứng dụng xác thực của tài khoản quản trị.
          </p>
          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void submitOtp();
            }}
          >
            <label className={authLabelClass} htmlFor="login-otp">
              Mã xác thực
            </label>
            <input
              id="login-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className={authOtpFieldClass}
              placeholder="000000"
            />
            <button
              type="submit"
              disabled={otpPending || otp.trim().length !== 6}
              className={authPrimaryButtonClass}
            >
              {otpPending ? "Đang xác thực..." : "Xác nhận"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        <AuthBackHome />
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
