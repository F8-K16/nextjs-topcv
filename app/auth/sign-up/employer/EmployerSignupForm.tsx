"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  Building,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPinHouse,
  Phone,
  Terminal,
  User,
} from "lucide-react";

import { authService } from "@/services/auth.service";
import {
  EmployerSignupFormData,
  employerSignupSchema,
} from "@/app/validations/auth.schema";
import { useLocationStore } from "@/app/stores/location.store";
import {
  authFieldClass,
  authFormCardClass,
  authFormFooterTextClass,
  authFormShellClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryLinkClass,
} from "@/lib/auth-ui";
import AuthBackHome from "../../components/AuthBackHome";
import OptionSelect from "@/components/ui/option-select";

export default function EmployerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    provinces,
    districtsMap,
    fetchProvinces,
    fetchDistricts,
    loadingDistrict,
  } = useLocationStore();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployerSignupFormData>({
    resolver: zodResolver(employerSignupSchema),
    defaultValues: {
      roles: ["EMPLOYER"],
      joinMode: "new_company",
      agree: false,
    },
  });

  const joinMode = watch("joinMode");
  const provinceId = watch("provinceId");
  const districts = provinceId ? (districtsMap[provinceId] ?? []) : [];

  /* Pre-fill invite token từ query string */
  useEffect(() => {
    const inv = searchParams.get("invite")?.trim();
    if (inv) {
      setValue("joinMode", "invite");
      setValue("inviteToken", inv);
    }
  }, [searchParams, setValue]);

  useEffect(() => { void fetchProvinces(); }, [fetchProvinces]);

  useEffect(() => {
    if (provinceId) void fetchDistricts(provinceId);
  }, [provinceId, fetchDistricts]);

  const onSubmit = async (data: EmployerSignupFormData) => {
    const payload =
      data.joinMode === "invite"
        ? {
            email: data.email,
            username: data.username,
            password: data.password,
            phone: data.phone,
            roles: ["EMPLOYER"],
            inviteToken: data.inviteToken?.trim(),
          }
        : {
            email: data.email,
            username: data.username,
            password: data.password,
            phone: data.phone,
            roles: ["EMPLOYER"],
            companyName: data.companyName,
            location: data.location,
            provinceId: data.provinceId,
            districtId: data.districtId,
          };

    const res = await authService.requestRegister(payload);

    if (!res.success) {
      if (res.errors) {
        Object.entries(res.errors).forEach(([field, message]) => {
          setError(field as keyof EmployerSignupFormData, {
            type: "server",
            message,
          });
        });
        return;
      }
      toast.error(res.message || "Đăng ký thất bại");
      return;
    }

    router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <div className={authFormShellClass}>
      <div className={authFormCardClass}>
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <AuthBackHome className="mb-0" />
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-primary"
          >
            Đăng ký ứng viên
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Đăng ký nhà tuyển dụng
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {joinMode === "invite"
            ? "Bạn được mời tham gia công ty có sẵn. Email phải trùng với email trong lời mời. Sau khi xác thực, bạn có thể đăng nhập ngay nếu công ty đã được kích hoạt."
            : "Gửi đầy đủ thông tin bên dưới. Tài khoản nhà tuyển dụng cần được quản trị viên duyệt trước khi đăng nhập."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
          {/* Hình thức tham gia */}
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 space-y-3">
            <p className="text-sm font-semibold text-zinc-800">Hình thức tham gia</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                <input
                  type="radio"
                  value="new_company"
                  {...register("joinMode")}
                  className="text-primary"
                />
                Tạo công ty mới
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm transition has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary">
                <input
                  type="radio"
                  value="invite"
                  {...register("joinMode")}
                  className="text-primary"
                />
                Tôi có lời mời (mã / liên kết)
              </label>
            </div>
          </div>

          {/* Thông tin tài khoản */}
          <div>
            <label className={authLabelClass} htmlFor="e-username">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="e-username"
                placeholder="Nguyễn Thị B"
                {...register("username")}
                className={authFieldClass}
              />
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            </div>
            {errors.username && (
              <p className="mt-1.5 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className={authLabelClass} htmlFor="e-email">
              Email <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="e-email"
                type="email"
                placeholder="hr@company.com"
                {...register("email")}
                className={authFieldClass}
              />
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className={authLabelClass} htmlFor="e-phone">
              Số điện thoại <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="e-phone"
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

          {/* Mã mời hoặc thông tin công ty */}
          {joinMode === "invite" ? (
            <div>
              <label className={authLabelClass} htmlFor="e-invite">
                Mã giới thiệu <span className="text-red-600">*</span>
              </label>
              <p className="mb-1 text-xs text-zinc-500">
                Dán toàn bộ mã từ liên kết đăng ký hoặc từ email nội bộ.
              </p>
              <div className="relative mt-1">
                <Terminal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <input
                  id="e-invite"
                  placeholder="64 ký tự hex…"
                  {...register("inviteToken")}
                  className={authFieldClass}
                  autoComplete="off"
                />
              </div>
              {errors.inviteToken && (
                <p className="mt-1.5 text-sm text-red-600">{errors.inviteToken.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <p className="text-sm font-semibold text-zinc-800">Thông tin công ty</p>

              <div>
                <label className={authLabelClass} htmlFor="e-company">
                  Tên công ty <span className="text-red-600">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="e-company"
                    placeholder="Công ty TNHH…"
                    {...register("companyName")}
                    className={authFieldClass}
                  />
                  <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                </div>
                {errors.companyName && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className={authLabelClass} htmlFor="e-location">
                  Địa chỉ <span className="text-red-600">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="e-location"
                    placeholder="Số nhà, đường, phường…"
                    {...register("location")}
                    className={authFieldClass}
                  />
                  <MapPinHouse className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                </div>
                {errors.location && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={authLabelClass} htmlFor="e-province">
                    Tỉnh / Thành phố <span className="text-red-600">*</span>
                  </label>
                  <div className="mt-1">
                    <Controller
                      control={control}
                      name="provinceId"
                      render={({ field }) => (
                        <OptionSelect
                          ariaLabel="Tỉnh / Thành phố"
                          placeholder="Chọn tỉnh/thành"
                          value={field.value ? String(field.value) : ""}
                          options={provinces.map((p) => ({
                            value: String(p.id),
                            label: p.name,
                          }))}
                          onChange={(next) => {
                            field.onChange(next ? Number(next) : undefined);
                            setValue("districtId", undefined);
                          }}
                        />
                      )}
                    />
                  </div>
                  {errors.provinceId && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.provinceId.message}</p>
                  )}
                </div>

                <div>
                  <label className={authLabelClass} htmlFor="e-district">
                    Quận / Huyện <span className="text-red-600">*</span>
                  </label>
                  <div className="mt-1">
                    <Controller
                      control={control}
                      name="districtId"
                      render={({ field }) => (
                        <OptionSelect
                          ariaLabel="Quận / Huyện"
                          placeholder={
                            loadingDistrict ? "Đang tải…" : "Chọn quận/huyện"
                          }
                          disabled={!provinceId || loadingDistrict}
                          value={field.value ? String(field.value) : ""}
                          options={districts.map((d) => ({
                            value: String(d.id),
                            label: d.name,
                          }))}
                          onChange={(next) =>
                            field.onChange(next ? Number(next) : undefined)
                          }
                        />
                      )}
                    />
                  </div>
                  {errors.districtId && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.districtId.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mật khẩu */}
          <div>
            <label className={authLabelClass} htmlFor="e-password">
              Mật khẩu <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="e-password"
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
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className={authLabelClass} htmlFor="e-confirm">
              Xác nhận mật khẩu <span className="text-red-600">*</span>
            </label>
            <div className="relative mt-1">
              <input
                id="e-confirm"
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
            {isSubmitting ? "Đang gửi…" : "Gửi yêu cầu đăng ký"}
          </button>
        </form>

        <p className={authFormFooterTextClass}>
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className={authSecondaryLinkClass}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
