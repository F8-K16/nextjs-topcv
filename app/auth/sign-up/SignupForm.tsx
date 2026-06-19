/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { SignupFormData, signupSchema } from "@/app/validations/auth.schema";
import Link from "next/link";

import {
  Building,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPinCheckInside,
  MapPinHouse,
  Phone,
  Terminal,
  User,
} from "lucide-react";
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
import AuthSocialSection from "../components/AuthSocialSection";
import { API_BASE_URL } from "@/lib/api-base-url";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const apiBase = API_BASE_URL?.replace(/\/$/, "") ?? "";
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER" | null>(null);
  const [employerJoinMode, setEmployerJoinMode] = useState<
    "new_company" | "invite"
  >("new_company");

  const {
    provinces,
    districtsMap,
    fetchProvinces,
    fetchDistricts,
    loadingDistrict,
  } = useLocationStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      roles: [],
      agree: false,
      inviteToken: "",
    },
  });

  const provinceId = watch("provinceId");
  const districts = provinceId ? districtsMap[provinceId] || [] : [];

  const onSubmit = async (data: SignupFormData) => {
    if (!role) {
      toast.error("Vui lòng chọn vai trò");
      return;
    }

    const payload =
      role === "EMPLOYER" && employerJoinMode === "invite"
        ? {
            email: data.email,
            username: data.username,
            password: data.password,
            phone: data.phone,
            roles: data.roles,
            inviteToken: data.inviteToken?.trim() || undefined,
          }
        : role === "EMPLOYER" && employerJoinMode === "new_company"
          ? {
              ...data,
              inviteToken: undefined,
            }
          : data;

    const res = await authService.requestRegister(payload);

    if (!res.success) {
      if (res.errors) {
        Object.entries(res.errors).forEach(([field, message]) => {
          setError(field as keyof SignupFormData, {
            type: "server",
            message,
          });
        });
        return;
      }

      if (res.message) {
        toast.error(res.message);
      }

      return;
    }
    router.push(`/auth/verify-email?email=${data.email}`);
  };

  useEffect(() => {
    void fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    const inv = searchParams.get("invite")?.trim();
    if (!inv) return;
    setEmployerJoinMode("invite");
    setValue("inviteToken", inv);
    setRole("EMPLOYER");
    setValue("roles", ["EMPLOYER"]);
  }, [searchParams, setValue]);

  useEffect(() => {
    if (provinceId) {
      void fetchDistricts(provinceId);
    }
  }, [provinceId, fetchDistricts]);

  const provinceRegister = register("provinceId", {
    setValueAs: (v) => (v ? Number(v) : undefined),
  });

  return (
    <>
      {!role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 backdrop-blur-sm">
          <div className="animate-fadeIn w-full max-w-3xl rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-xl shadow-zinc-950/12 sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Bạn tham gia với vai trò nào?
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Chọn một lựa chọn để tiếp tục đăng ký.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <button
                type="button"
                onClick={() => {
                  setRole("CANDIDATE");
                  setValue("roles", ["CANDIDATE"]);
                  setValue("inviteToken", "");
                }}
                className="group flex flex-col items-center rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 p-8 text-center transition hover:border-primary hover:bg-white hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 text-5xl">👨‍💼</div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Ứng viên
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Tìm việc và ứng tuyển phù hợp
                </p>
                <span className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition group-hover:opacity-95">
                  Chọn
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("EMPLOYER");
                  setValue("roles", ["EMPLOYER"]);
                  const inv = searchParams.get("invite")?.trim();
                  if (inv) {
                    setEmployerJoinMode("invite");
                    setValue("inviteToken", inv);
                  } else {
                    setEmployerJoinMode("new_company");
                    setValue("inviteToken", "");
                  }
                }}
                className="group flex flex-col items-center rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 p-8 text-center transition hover:border-primary hover:bg-white hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 text-5xl">🏢</div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  Nhà tuyển dụng
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Đăng tin và quản lý ứng viên
                </p>
                <span className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition group-hover:opacity-95">
                  Chọn
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={authFormShellClass}>
        <div className={authFormCardClass}>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Đăng ký {role === "CANDIDATE" ? "ứng viên" : "nhà tuyển dụng"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            {role === "EMPLOYER" ? (
              employerJoinMode === "invite" ? (
                <>
                  Bạn được mời tham gia công ty có sẵn trên hệ thống. Chỉ cần
                  tài khoản bên dưới; email phải trùng với email trong lời mời.
                  Sau khi xác thực email, nếu công ty đã được kích hoạt bạn có
                  thể đăng nhập ngay.
                </>
              ) : (
                <>
                  Gửi đầy đủ thông tin bên dưới. Tài khoản nhà tuyển dụng cần
                  được quản trị viên duyệt — chỉ khi đã duyệt bạn mới đăng nhập
                  được bằng email và mật khẩu đã đăng ký. Đăng ký qua Google
                  hiện chỉ dành cho ứng viên.
                </>
              )
            ) : (
              <>
                Điền thông tin để tạo tài khoản. Bạn có thể bổ sung hồ sơ sau
                khi xác thực email.
              </>
            )}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className={authLabelClass} htmlFor="su-username">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="su-username"
                  placeholder="Nguyễn Văn A"
                  {...register("username")}
                  className={authFieldClass}
                />
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                  aria-hidden
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className={authLabelClass} htmlFor="su-email">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="su-email"
                  placeholder="email@example.com"
                  {...register("email")}
                  className={authFieldClass}
                />
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                  aria-hidden
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className={authLabelClass} htmlFor="su-phone">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="su-phone"
                  placeholder="0xxxxxxxxx"
                  {...register("phone")}
                  className={authFieldClass}
                />
                <Phone
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                  aria-hidden
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {role === "EMPLOYER" && (
              <div className="space-y-5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-5">
                <h3 className="text-sm font-semibold text-zinc-800">
                  Hình thức tham gia
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm has-checked:border-primary has-checked:ring-1 has-checked:ring-primary">
                    <input
                      type="radio"
                      name="employerJoinMode"
                      className="text-primary"
                      checked={employerJoinMode === "new_company"}
                      onChange={() => {
                        setEmployerJoinMode("new_company");
                        setValue("inviteToken", "");
                      }}
                    />
                    Tạo công ty mới
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm has-checked:border-primary has-checked:ring-1 has-checked:ring-primary">
                    <input
                      type="radio"
                      name="employerJoinMode"
                      className="text-primary"
                      checked={employerJoinMode === "invite"}
                      onChange={() => {
                        setEmployerJoinMode("invite");
                        setValue("companyName", "");
                        setValue("location", "");
                        setValue("provinceId", undefined);
                        setValue("districtId", undefined);
                      }}
                    />
                    Tôi có lời mời (liên kết / mã)
                  </label>
                </div>

                {employerJoinMode === "invite" ? (
                  <div>
                    <label className={authLabelClass} htmlFor="su-invite">
                        Mã giới thiệu <span className="text-red-600">*</span>
                    </label>
                    <p className="mb-1 text-xs text-zinc-500">
                      Dán toàn bộ mã từ liên kết đăng ký hoặc từ email nội bộ.
                    </p>
                    <div className="relative mt-1">
                      <Terminal
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                        aria-hidden
                      />
                      <input
                        id="su-invite"
                        placeholder="64 ký tự hex…"
                        {...register("inviteToken")}
                        className={authFieldClass}
                        autoComplete="off"
                      />
                      {errors.inviteToken && (
                        <p className="mt-1.5 text-sm text-red-600">
                          {errors.inviteToken.message}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-zinc-800">
                      Thông tin công ty
                    </h3>
                    <div>
                      <label className={authLabelClass} htmlFor="su-company">
                        Tên công ty <span className="text-red-600">*</span>
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="su-company"
                          placeholder="Công ty TNHH..."
                          {...register("companyName")}
                          className={authFieldClass}
                        />
                        <Building
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                          aria-hidden
                        />
                      </div>
                      {errors.companyName && (
                        <p className="mt-1.5 text-sm text-red-600">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={authLabelClass} htmlFor="su-location">
                        Địa chỉ <span className="text-red-600">*</span>
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="su-location"
                          placeholder="Số nhà, đường, phường..."
                          {...register("location")}
                          className={authFieldClass}
                        />
                        <MapPinHouse
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                          aria-hidden
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={authLabelClass} htmlFor="su-province">
                          Tỉnh / Thành phố <span className="text-red-600">*</span>
                        </label>
                        <div className="relative mt-1">
                          <select
                            id="su-province"
                            {...provinceRegister}
                            onChange={(e) => {
                              provinceRegister.onChange(e);
                              setValue("districtId", undefined);
                            }}
                            className={`${authFieldClass} appearance-none pr-8`}
                          >
                            <option value="">Chọn tỉnh/thành</option>
                            {provinces.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                        </div>
                      </div>

                      <div>
                        <label className={authLabelClass} htmlFor="su-district">
                          Quận / Huyện <span className="text-red-600">*</span>
                        </label>
                        <div className="relative mt-1">
                          <select
                            id="su-district"
                            {...register("districtId", {
                              setValueAs: (v) => (v ? Number(v) : undefined),
                            })}
                            disabled={!provinceId || loadingDistrict}
                            className={`${authFieldClass} appearance-none pr-8 disabled:cursor-not-allowed disabled:bg-zinc-100`}
                          >
                            <option value="">
                              {loadingDistrict
                                ? "Đang tải..."
                                : "Chọn quận/huyện"}
                            </option>
                            {districts.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                          <MapPinCheckInside className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className={authLabelClass} htmlFor="su-password">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="su-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
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
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className={authLabelClass} htmlFor="su-confirm">
                Xác nhận mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="su-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`${authFieldClass} pr-11`}
                />
                <LockKeyhole
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                  aria-label={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.confirmPassword!.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                {...register("agree")}
                className="mt-1 rounded border-zinc-300 text-primary focus:ring-primary"
              />
              <label>
                Tôi đã đọc và đồng ý với{" "}
                <span className="cursor-pointer font-medium text-primary">
                  Điều khoản dịch vụ
                </span>{" "}
                và{" "}
                <span className="cursor-pointer font-medium text-primary">
                  Chính sách bảo mật
                </span>
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
              {isSubmitting ? "Đang gửi…" : "Đăng ký"}
            </button>
          </form>

          {role === "CANDIDATE" && (
            <AuthSocialSection
              googleAuthHref={apiBase ? `${apiBase}/auth/google` : undefined}
            />
          )}
          <p className={authFormFooterTextClass}>
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className={authSecondaryLinkClass}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
