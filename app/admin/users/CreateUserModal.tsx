"use client";

import { roleLabelMap } from "@/app/types/role.type";
import { Role } from "@/app/types/user.type";
import { createUserSchema } from "@/app/validations/user.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { userService } from "@/services/user.service";
import {
  applyFieldErrorsToForm,
  resolveSubmitError,
} from "@/lib/submit-error";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = z.infer<typeof createUserSchema>;

export default function CreateUserModal({
  onClose,
  roles,
}: {
  onClose: () => void;
  roles: Role[];
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      phone: "",
      roles: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await userService.createUser(data);

      toast.success("Thêm mới thành công");
      onClose();
      router.refresh();
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border border-gray-700 bg-[#1e1e1e] text-white">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="create-user-username"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Họ và tên
              </label>
              <input
                id="create-user-username"
                {...register("username")}
                className="w-full rounded-lg border border-white/5 bg-[#2f2f2f] p-2.5 text-sm"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="create-user-email"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="create-user-email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full rounded-lg border border-white/5 bg-[#2f2f2f] p-2.5 text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="create-user-password"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Mật khẩu
              </label>
              <input
                id="create-user-password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className="w-full rounded-lg border border-white/5 bg-[#2f2f2f] p-2.5 text-sm"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="create-user-phone"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Số điện thoại
              </label>
              <input
                id="create-user-phone"
                {...register("phone")}
                placeholder="0xxxxxxxxx"
                className="w-full rounded-lg border border-white/5 bg-[#2f2f2f] p-2.5 text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="create-user-role"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Vai trò
              </label>
              <select
                id="create-user-role"
                className="w-full rounded-lg border border-white/5 bg-[#2f2f2f] p-2.5 text-sm"
                onChange={(e) => setValue("roles", [Number(e.target.value)])}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Chọn vai trò --
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {roleLabelMap[role.name] || role.name}
                  </option>
                ))}
              </select>
              {errors.roles && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.roles.message}
                </p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2.5 hover:bg-blue-600 disabled:opacity-50"
            >
              <Check size={16} />
              {isSubmitting ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
