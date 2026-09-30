"use client";

import { z } from "zod";
import { changePasswordSchema } from "@/app/validations/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileService } from "@/services/profile.service";
import {
  applyFieldErrorsToForm,
  resolveSubmitError,
} from "@/lib/submit-error";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";

type FormData = z.infer<typeof changePasswordSchema>;

export default function FormChangePassword() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await profileService.changePassword(data);
      toast.success("Đổi mật khẩu thành công");
      reset();
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-black/20"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Đổi mật khẩu
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Dùng mật khẩu mạnh và không dùng lại mật khẩu ở site khác.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Mật khẩu hiện tại
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type={showOld ? "text" : "password"}
            autoComplete="current-password"
            {...register("oldPassword")}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 outline-none transition focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f] dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-500/30"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00b14f] dark:text-zinc-400 dark:hover:text-violet-300"
          >
            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.oldPassword && (
          <p className="text-red-500 text-sm mt-2">{errors.oldPassword.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Mật khẩu mới
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            {...register("newPassword")}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 outline-none transition focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f] dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-500/30"
            placeholder="Tối thiểu 6 ký tự"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00b14f] dark:text-zinc-400 dark:hover:text-violet-300"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-2">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Nhập lại mật khẩu mới
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 outline-none transition focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f] dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-500/30"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00b14f] dark:text-zinc-400 dark:hover:text-violet-300"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-2">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00b14f] font-semibold text-white transition hover:bg-[#009944] disabled:opacity-70 dark:bg-violet-600 dark:hover:bg-violet-500"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          "Cập nhật mật khẩu"
        )}
      </button>
    </form>
  );
}
