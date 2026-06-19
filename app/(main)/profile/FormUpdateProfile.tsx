/* eslint-disable react-hooks/incompatible-library */
"use client";

import { z } from "zod";
import { updateProfileSchema } from "@/app/validations/auth.schema";
import UploadButton from "@/components/UploadButton";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/stores/auth.store";
import { profileService } from "@/services/profile.service";
import {
  Camera,
  Mail,
  Phone,
  User,
  Loader2,
  Building2,
  MapPinCheckInside,
  Inbox,
} from "lucide-react";
import UserAvatar from "../components/UserAvatar";
import { useLocationStore } from "@/app/stores/location.store";
import { applyFieldErrorsToForm, resolveSubmitError } from "@/lib/submit-error";

export default function FormUpdateProfile() {
  const { user, setAuth, accessToken } = useAuthStore();
  const {
    provinces,
    districtsMap,
    fetchProvinces,
    fetchDistricts,
    loadingDistrict,
  } = useLocationStore();

  const isCandidate = user?.roles?.includes("CANDIDATE") ?? false;

  type FormData = z.infer<typeof updateProfileSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      avatar: "",
      provinceId: undefined,
      districtId: undefined,
      receiveEmailNotifications: true,
    },
  });

  const provinceId = watch("provinceId");
  const prevProvinceId = useRef<number | undefined>(undefined);

  const profileKey = useMemo(() => {
    if (!user?.id) return "";
    return [
      user.id,
      user.username,
      user.email,
      user.phone,
      user.provinceId,
      user.districtId,
      String(user.receiveEmailNotifications ?? true),
    ].join("|");
  }, [
    user?.id,
    user?.username,
    user?.email,
    user?.phone,
    user?.provinceId,
    user?.districtId,
    user?.receiveEmailNotifications,
  ]);

  const districts = provinceId ? districtsMap[provinceId] || [] : [];

  useEffect(() => {
    void fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    if (provinceId) {
      void fetchDistricts(provinceId);
    }
  }, [provinceId, fetchDistricts]);

  useEffect(() => {
    if (prevProvinceId.current === provinceId) return;
    if (prevProvinceId.current !== undefined) {
      setValue("districtId", undefined);
    }
    prevProvinceId.current = provinceId;
  }, [provinceId, setValue]);

  useEffect(() => {
    if (!profileKey) return;
    const u = useAuthStore.getState().user;
    if (!u?.id) return;

    reset({
      username: u.username ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      avatar: u.avatar ?? "",
      provinceId: u.provinceId ?? undefined,
      districtId: u.districtId ?? undefined,
      receiveEmailNotifications: u.receiveEmailNotifications ?? true,
    });
    prevProvinceId.current = u.provinceId ?? undefined;
  }, [profileKey, reset]);

  const avatarPreview = watch("avatar");
  const usernamePreview = watch("username");

  const onSubmit = async (data: FormData) => {
    try {
      const payload: Parameters<typeof profileService.updateProfile>[0] = {
        username: data.username,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        receiveEmailNotifications: data.receiveEmailNotifications,
      };

      if (isCandidate && data.provinceId != null && data.districtId != null) {
        payload.provinceId = data.provinceId;
        payload.districtId = data.districtId;
      }

      const res = await profileService.updateProfile(payload);
      const body = res.data as {
        data?: import("@/app/stores/auth.store").User;
      };
      const next = body.data;
      if (next) setAuth(next, accessToken);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật hồ sơ của bạn để nhà tuyển dụng dễ dàng tìm thấy hơn.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-linear-to-b from-gray-50 to-white p-6">
        <div className="group relative">
          <UserAvatar
            avatar={avatarPreview}
            username={usernamePreview}
            size={70}
          />

          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="font-medium text-gray-700">Ảnh đại diện</p>
          <p className="text-sm text-gray-500">
            JPG, PNG hoặc WEBP. Hình vuông sẽ đẹp nhất.
          </p>

          <UploadButton
            signatureEndpoint="/api/sign-cloudinary-params"
            className="cursor-pointer rounded-full bg-green-500 px-3 py-1 text-white hover:bg-green-600"
            uploadPreset="F8_TopCV"
            options={{ tags: ["avatar"] }}
            onSuccess={(results: CloudinaryUploadWidgetResults) => {
              const info = results?.info;
              const url =
                typeof info === "object" && info !== null
                  ? info.secure_url
                  : undefined;

              if (url) {
                setValue("avatar", url, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                if (user && accessToken) {
                  setAuth({ ...user, avatar: url }, accessToken);
                }
              }
            }}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Họ và tên
        </label>

        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            {...register("username")}
            className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f]"
            placeholder="Nhập họ tên"
          />
        </div>

        {errors.username && (
          <p className="mt-2 text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email
        </label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="email"
            {...register("email")}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-gray-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Số điện thoại
        </label>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            {...register("phone")}
            className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f]"
            placeholder="Nhập số điện thoại"
          />
        </div>

        {errors.phone && (
          <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {isCandidate ? (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Tỉnh/thành & quận/huyện (ứng viên)
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Dùng cho hồ sơ ứng viên. Chọn cả hai hoặc để trống nếu chưa cần
              cập nhật.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm text-gray-600">
                Tỉnh/Thành phố
              </label>
              <div className="relative">
                <select
                  {...register("provinceId", {
                    setValueAs: (v) => (v ? Number(v) : undefined),
                  })}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f]"
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00b14f]" />
              </div>
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm text-gray-600">
                Quận/Huyện
              </label>
              <div className="relative">
                <select
                  {...register("districtId", {
                    setValueAs: (v) => (v ? Number(v) : undefined),
                  })}
                  disabled={!provinceId || loadingDistrict}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f] disabled:bg-gray-100 disabled:opacity-60"
                >
                  <option value="">
                    {loadingDistrict ? "Đang tải..." : "Chọn quận/huyện"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <MapPinCheckInside className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00b14f]" />
              </div>
            </div>
          </div>
          {(errors.provinceId || errors.districtId) && (
            <p className="text-sm text-red-500">
              {errors.provinceId?.message || errors.districtId?.message}
            </p>
          )}
        </div>
      ) : null}

      <div className="border-t border-gray-100 pt-6">
        <div className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
          <Inbox
            className="mt-0.5 h-5 w-5 shrink-0 text-[#00b14f]"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Email thông báo
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Nhận gợi ý việc làm, tóm tắt đơn ứng tuyển và cập nhật từ hệ
              thống.
            </p>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#00b14f] focus:ring-[#00b14f]"
                {...register("receiveEmailNotifications")}
              />
              Cho phép gửi email thông báo
            </label>
          </div>
        </div>
        {errors.receiveEmailNotifications && (
          <p className="mt-2 text-sm text-red-500">
            {errors.receiveEmailNotifications.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00b14f] font-semibold text-white transition hover:bg-[#009944] disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          "Lưu thay đổi"
        )}
      </button>
    </form>
  );
}
