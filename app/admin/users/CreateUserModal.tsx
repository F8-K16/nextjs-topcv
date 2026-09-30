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
import { ADMIN_MODAL_SELECT, adminDialogSurface, adminInput, adminLabel } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

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
      <DialogContent className={cn("border", adminDialogSurface)}>
        <DialogHeader>
          <DialogTitle>Tạo tài khoản</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="create-user-username"
                className={adminLabel}
              >
                Họ và tên
              </label>
              <input
                id="create-user-username"
                {...register("username")}
                className={adminInput}
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
                className={adminLabel}
              >
                Email
              </label>
              <input
                id="create-user-email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={adminInput}
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
                className={adminLabel}
              >
                Mật khẩu
              </label>
              <input
                id="create-user-password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className={adminInput}
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
                className={adminLabel}
              >
                Số điện thoại
              </label>
              <input
                id="create-user-phone"
                {...register("phone")}
                placeholder="0xxxxxxxxx"
                className={adminInput}
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
                className={adminLabel}
              >
                Vai trò
              </label>
              <select
                id="create-user-role"
                className={ADMIN_MODAL_SELECT}
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
