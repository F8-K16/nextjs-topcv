"use client";

import { useModalStore } from "@/app/stores/modal.store";
import { useActionState, useEffect, useState } from "react";
import {
  LoginState,
  getCurrentUser,
  loginAction,
} from "@/app/actions/auth.action";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Mail, X } from "lucide-react";
import AuthSocialSection from "@/app/auth/components/AuthSocialSection";
import { API_BASE_URL } from "@/lib/api-base-url";

const initialState: LoginState = {};

export default function LoginModal() {
  const { isOpen, type, closeModal } = useModalStore();

  const apiBase = API_BASE_URL?.replace(/\/$/, "") ?? "";
  const [state, action, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleLogin = async () => {
      if (!state.success) return;

      const res = await getCurrentUser();
      if (!res) return;

      closeModal();
      window.location.reload();
    };

    handleLogin();
  }, [state.success, closeModal]);

  if (!isOpen || type !== "login") return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-140 bg-white rounded-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex gap-8 font-semibold text-gray-700">
            <button className="text-[#00b14f] border-b-2 border-[#00b14f] pb-1">
              Đăng Nhập
            </button>

            <Link href="/auth/sign-up" className="hover:text-[#00b14f]">
              Đăng Ký
            </Link>
          </div>

          <button onClick={closeModal}>
            <X className="text-gray-400 hover:text-black" />
          </button>
        </div>

        <div className="p-6">
          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>

              <div className="relative">
                <input
                  type="text"
                  name="email"
                  placeholder="Nhập email"
                  className="w-full border rounded px-12 py-2 outline-none focus:ring-2 focus:ring-green-500"
                />
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00b14f]"
                />
              </div>

              {state.fieldErrors?.email && (
                <p className="text-red-500 text-sm mt-1">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full border rounded px-12 py-2 pr-12 outline-none focus:ring-2 focus:ring-green-500"
                />

                <KeyRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00b14f]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {state.fieldErrors?.password && (
                <p className="text-red-500 text-sm mt-1">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}

            <button
              disabled={pending}
              className="w-full bg-[#00b14f] hover:bg-green-700 text-white py-2.5 rounded font-semibold disabled:opacity-50"
            >
              {pending ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <AuthSocialSection
            googleAuthHref={apiBase ? `${apiBase}/auth/google` : undefined}
          />

          <div className="flex justify-between text-sm mt-6">
            <p>
              Bạn chưa có tài khoản?{" "}
              <Link href="/auth/sign-up" className="text-[#00b14f] font-medium">
                Đăng ký ngay
              </Link>
            </p>

            <button className="text-[#00b14f] font-medium">
              Quên mật khẩu
            </button>
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 text-sm text-gray-600">
          <p className="font-semibold mb-1">
            Bạn gặp khó khăn khi tạo tài khoản?
          </p>
          <p>Vui lòng gọi tới số 024 6680 5588 (giờ hành chính).</p>
        </div>
      </div>
    </div>
  );
}
