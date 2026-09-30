"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/app/stores/auth.store";
import { getErrorToastMessage } from "@/lib/submit-error";
import { adminSecurityService } from "@/services/admin-security.service";

export default function AdminSecurityPageClient() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const enabled = user?.totpEnabled === true;
  const [setup, setSetup] = useState<{
    secret: string;
    qrDataUrl: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const markEnabled = (totpEnabled: boolean) => {
    if (!user) return;
    setAuth({ ...user, totpEnabled }, accessToken);
  };

  const onSetup = async () => {
    setPending(true);
    try {
      const data = await adminSecurityService.setup();
      setSetup({ secret: data.secret, qrDataUrl: data.qrDataUrl });
      toast.success("Quét mã QR bằng ứng dụng xác thực, rồi nhập mã 6 số.");
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Không tạo được mã xác thực");
    } finally {
      setPending(false);
    }
  };

  const onEnable = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await adminSecurityService.enable(code.trim());
      markEnabled(true);
      setSetup(null);
      setCode("");
      toast.success("Đã bật xác thực hai lớp");
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Mã xác thực không đúng");
    } finally {
      setPending(false);
    }
  };

  const onDisable = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await adminSecurityService.disable(password, code.trim());
      markEnabled(false);
      setCode("");
      setPassword("");
      toast.success("Đã tắt xác thực hai lớp. Hãy bật lại trước khi dùng trang quản trị.");
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Không tắt được xác thực hai lớp");
    } finally {
      setPending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
        Xác thực hai lớp chỉ áp dụng cho tài khoản quản trị.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Xác thực hai lớp</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Tài khoản Admin bắt buộc dùng mã từ ứng dụng xác thực (Google
          Authenticator, 1Password, Authy) sau khi đăng nhập.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Trạng thái: {enabled ? "Đang bật" : "Chưa bật"}
        </p>
        {!enabled ? (
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={() => void onSetup()}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending && !setup ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Tạo mã xác thực
            </button>
            {setup ? (
              <form onSubmit={onEnable} className="space-y-4">
                {/* QR is a data URL generated on the server; next/image does not add value here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setup.qrDataUrl}
                  alt="Mã QR xác thực hai lớp"
                  className="h-44 w-44 rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/15"
                />
                <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">
                  Không quét được QR? Nhập khóa thủ công: {setup.secret}
                </p>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Mã 6 số
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 tracking-[0.3em] text-zinc-900 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                </label>
                <button
                  type="submit"
                  disabled={pending || code.trim().length !== 6}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Bật xác thực hai lớp
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <form onSubmit={onDisable} className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Mật khẩu hiện tại
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Mã 6 số
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 tracking-[0.3em] text-zinc-900 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 disabled:opacity-60 dark:border-white/15 dark:text-zinc-100"
            >
              Tắt để thiết lập lại
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
