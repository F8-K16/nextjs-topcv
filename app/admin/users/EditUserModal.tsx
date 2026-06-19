"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserSchema } from "@/app/validations/user.schema";
import { updateCompanySchema } from "@/app/validations/company.schema";
import { Role } from "@/app/types/user.type";
import type { User } from "@/app/types/user.type";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, Loader2, Save } from "lucide-react";
import { userService } from "@/services/user.service";
import { roleLabelMap } from "@/app/types/role.type";
import { companyService } from "@/services/company.service";
import { locationService } from "@/services/location.service";
import axiosClient from "@/lib/axios";
import UploadButton from "@/components/UploadButton";
import { getErrorToastMessage, resolveSubmitError } from "@/lib/submit-error";
import {
  adminBorderSubtle,
  adminDialogSurface,
  adminInput,
  adminLabel,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import Image from "next/image";

function phoneToDisplayInput(phone?: string | null): string {
  if (!phone?.trim()) return "";
  const p = phone.replace(/[\s.-]/g, "");
  if (p.startsWith("+84") && p.length >= 11) return `0${p.slice(3)}`;
  return phone.trim();
}

type UserFormData = z.infer<typeof updateUserSchema>;
type CompanyFormData = z.infer<typeof updateCompanySchema>;

type AdminUserDetail = User & {
  employer?: {
    id: number;
    companyId: number | null;
    status: string;
    company: {
      id: number;
      name: string;
      description: string | null;
      logo: string | null;
      website: string | null;
      location: string;
      status: boolean;
      provinceId: number;
      districtId: number;
      categories: {
        category: { id: number; name: string; slug: string };
      }[];
    } | null;
  } | null;
};

export default function EditUserModal({
  user,
  roles,
  onClose,
}: {
  user: User;
  roles: Role[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [districtInit, setDistrictInit] = useState(true);

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
  });

  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    setError: setUserError,
    reset: resetUser,
    formState: {
      errors: userErrors,
      isSubmitting: userSubmitting,
      isDirty: userDirty,
    },
  } = userForm;

  const {
    register: registerCo,
    setError: setCoError,
    control: coControl,
    watch: watchCo,
    setValue: setCoValue,
    reset: resetCo,
    formState: {
      errors: coErrors,
      isDirty: coDirty,
      isSubmitting: coSubmitting,
    },
  } = companyForm;

  const coProvinceId = watchCo("provinceId");

  const isEmployerRole = useMemo(
    () => detail?.userRoles?.some((ur) => ur.role.name === "EMPLOYER"),
    [detail],
  );

  const linkedCompany = detail?.employer?.company ?? null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [u, provs, compRes] = await Promise.all([
          userService.getUserById(user.id) as Promise<AdminUserDetail>,
          locationService.getProvinces(),
          axiosClient.get<{ categories?: { id: number; name: string }[] }>(
            "/admin/companies?page=1&limit=1",
          ),
        ]);
        if (cancelled) return;
        setDetail(u);
        setProvinces(provs);
        setCategories(compRes.data.categories ?? []);
        resetUser({
          email: u.email,
          username: u.username,
          password: "",
          phone: phoneToDisplayInput(u.userPhone?.phone),
          roles: u.userRoles.map((r) => r.role.id),
        });
        const c = u.employer?.company;
        if (c) {
          resetCo({
            name: c.name,
            description: c.description || "",
            location: c.location,
            website: c.website || "",
            logo: c.logo || "",
            status: c.status,
            provinceId: c.provinceId,
            districtId: c.districtId,
            categoryIds: c.categories?.map((x) => x.category.id) || [],
          });
          setDistrictInit(true);
        }
      } catch (e) {
        toast.error(
          getErrorToastMessage(e) || "Không tải được thông tin người dùng",
        );
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id, resetUser, resetCo, onClose]);

  useEffect(() => {
    if (typeof coProvinceId !== "number" || coProvinceId < 1) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingDistrict(true);
      try {
        const data = await locationService.getDistrictsByProvince(coProvinceId);
        if (!cancelled) setDistricts(data);
      } catch {
        if (!cancelled) toast.error("Không tải được quận/huyện");
      } finally {
        if (!cancelled) setLoadingDistrict(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coProvinceId]);

  useEffect(() => {
    if (!linkedCompany || !districtInit) return;
    if (districts.length === 0) return;
    const exists = districts.some((d) => d.id === linkedCompany.districtId);
    if (exists) {
      setCoValue("districtId", linkedCompany.districtId);
    }
    setDistrictInit(false);
  }, [districts, districtInit, linkedCompany, setCoValue]);

  const onSaveAll = handleSubmitUser(async (userData) => {
    if (!detail) return;

    if (linkedCompany) {
      const coOk = await companyForm.trigger();
      if (!coOk) return;
    }

    try {
      await userService.updateUser(user.id, userData);

      if (linkedCompany && coDirty) {
        const coValues = companyForm.getValues();
        await companyService.updateCompany(linkedCompany.id, coValues);
      }

      toast.success("Cập nhật thành công");
      onClose();
      router.refresh();
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field in userData) {
          setUserError(field as keyof UserFormData, {
            type: "server",
            message,
          });
        } else {
          setCoError(field as keyof CompanyFormData, {
            type: "server",
            message,
          });
        }
      }
      toast.error(toastMessage);
    }
  });

  const submitting = userSubmitting || coSubmitting;

  const logoPreview = watchCo("logo");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto md:max-w-2xl",
          adminDialogSurface,
        )}
      >
        <DialogHeader>
          <DialogTitle>{"Cập nhật tài khoản"}</DialogTitle>
        </DialogHeader>

        {loading || !detail ? (
          <div className="flex items-center justify-center gap-2 py-12 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            {"Đang tải…"}
          </div>
        ) : (
          <form onSubmit={onSaveAll} className="space-y-4">
            <div>
              <label
                htmlFor="edit-user-email"
                className={adminLabel}
              >
                Email
              </label>
              <input
                id="edit-user-email"
                {...registerUser("email")}
                disabled
                className={cn(adminInput, "cursor-not-allowed opacity-80")}
              />
              {userErrors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {userErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-user-username"
                className={adminLabel}
              >
                Họ và tên hiển thị
              </label>
              <input
                id="edit-user-username"
                {...registerUser("username")}
                className={adminInput}
              />
              {userErrors.username && (
                <p className="mt-1 text-sm text-red-400">
                  {userErrors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-user-password"
                className={adminLabel}
              >
                Mật khẩu mới
              </label>
              <input
                id="edit-user-password"
                type="password"
                placeholder="Để trống nếu không đổi"
                autoComplete="new-password"
                {...registerUser("password")}
                className={adminInput}
              />
              {userErrors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {userErrors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-user-phone"
                className={adminLabel}
              >
                Số điện thoại
              </label>
              <input
                id="edit-user-phone"
                {...registerUser("phone")}
                className={adminInput}
              />
              {userErrors.phone && (
                <p className="mt-1 text-sm text-red-400">
                  {userErrors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-user-role"
                className={adminLabel}
              >
                Vai trò
              </label>
              <select
                id="edit-user-role"
                {...registerUser("roles", {
                  setValueAs: (v) => [Number(v)],
                })}
                defaultValue={detail.userRoles[0]?.role.id}
                className={adminInput}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {roleLabelMap[role.name] || role.name}
                  </option>
                ))}
              </select>
              {userErrors.roles && (
                <p className="mt-1 text-sm text-red-400">
                  {userErrors.roles.message}
                </p>
              )}
            </div>

            {isEmployerRole && (
              <div
                className={cn("space-y-4 border-t pt-5", adminBorderSubtle)}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  Công ty liên kết (nhà tuyển dụng)
                </div>

                {!linkedCompany ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    Tài khoản chưa gắn công ty. Duyệt hồ sơ NTD chờ duyệt hoặc
                    tạo công ty và liên kết từ trang quản trị.
                  </p>
                ) : (
                  <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-100 p-4 dark:border-white/10 dark:bg-[#252525]">
                    <p className="text-xs text-zinc-500">
                      Cập nhật hồ sơ doanh nghiệp hiển thị công khai.
                    </p>

                    <div>
                      <label
                        htmlFor="co-name"
                        className={adminLabel}
                      >
                        Tên công ty
                      </label>
                      <input
                        id="co-name"
                        {...registerCo("name")}
                        className={adminInput}
                      />
                      {coErrors.name && (
                        <p className="mt-1 text-sm text-red-400">
                          {coErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="co-desc"
                        className={adminLabel}
                      >
                        Giới thiệu
                      </label>
                      <textarea
                        id="co-desc"
                        rows={3}
                        {...registerCo("description")}
                        className={adminInput}
                      />
                      {coErrors.description && (
                        <p className="mt-1 text-sm text-red-400">
                          {coErrors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="co-website"
                          className={adminLabel}
                        >
                          Website
                        </label>
                        <input
                          id="co-website"
                          {...registerCo("website")}
                          className={adminInput}
                        />
                        {coErrors.website && (
                          <p className="mt-1 text-sm text-red-400">
                            {coErrors.website.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="co-status"
                          className={adminLabel}
                        >
                          Trạng thái công khai
                        </label>
                        <Controller
                          control={coControl}
                          name="status"
                          render={({ field }) => (
                            <select
                              id="co-status"
                              value={field.value ? "true" : "false"}
                              onChange={(e) =>
                                field.onChange(e.target.value === "true")
                              }
                              className={adminInput}
                            >
                              <option value="true">Hoạt động (hiển thị)</option>
                              <option value="false">
                                Ngừng hoạt động (ẩn)
                              </option>
                            </select>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="co-location"
                        className={adminLabel}
                      >
                        Địa chỉ / khu vực
                      </label>
                      <input
                        id="co-location"
                        {...registerCo("location")}
                        className={adminInput}
                      />
                      {coErrors.location && (
                        <p className="mt-1 text-sm text-red-400">
                          {coErrors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="co-province"
                          className={adminLabel}
                        >
                          Tỉnh / Thành
                        </label>
                        <Controller
                          control={coControl}
                          name="provinceId"
                          render={({ field }) => (
                            <select
                              id="co-province"
                              className={adminInput}
                              value={field.value > 0 ? field.value : ""}
                              onChange={(e) => {
                                const v = e.target.value
                                  ? Number(e.target.value)
                                  : 0;
                                field.onChange(v);
                                setCoValue("districtId", 0, {
                                  shouldDirty: true,
                                });
                              }}
                            >
                              <option value="">-- Chọn --</option>
                              {provinces.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {coErrors.provinceId && (
                          <p className="mt-1 text-sm text-red-400">
                            {coErrors.provinceId.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="co-district"
                          className={adminLabel}
                        >
                          Quận / Huyện
                        </label>
                        <select
                          id="co-district"
                          {...registerCo("districtId", {
                            setValueAs: (v) => (v ? Number(v) : 0),
                          })}
                          disabled={
                            !coProvinceId || coProvinceId < 1 || loadingDistrict
                          }
                          className={cn(adminInput, "disabled:opacity-50")}
                        >
                          <option value="">
                            {loadingDistrict ? "Đang tải…" : "-- Chọn --"}
                          </option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        {coErrors.districtId && (
                          <p className="mt-1 text-sm text-red-400">
                            {coErrors.districtId.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className={adminLabel}>
                        Logo công ty
                      </span>
                      <p className="mb-2 text-xs text-zinc-500">
                        JPG, PNG hoặc WEBP
                      </p>
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt="Logo công ty"
                          width={96}
                          height={96}
                          className="mb-2 max-h-24 rounded-lg border border-zinc-200 object-contain dark:border-white/10"
                        />
                      ) : null}
                      <UploadButton
                        signatureEndpoint="/api/sign-cloudinary-params"
                        className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
                        uploadPreset="F8_TopCV"
                        options={{ tags: ["company-logo"] }}
                        onSuccess={(result: unknown) => {
                          const url = (
                            result as { info?: { secure_url?: string } }
                          )?.info?.secure_url;
                          if (url) {
                            setCoValue("logo", url, { shouldDirty: true });
                          }
                        }}
                      />
                      {coErrors.logo && (
                        <p className="mt-1 text-sm text-red-400">
                          {coErrors.logo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Danh mục ngành
                      </span>
                      <p className="mb-2 text-xs text-zinc-500">
                        Chọn một hoặc nhiều — dùng khi đăng tin theo đúng ngành.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => {
                          const selected = watchCo("categoryIds")?.includes(
                            c.id,
                          );
                          return (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => {
                                const current = watchCo("categoryIds") || [];
                                if (selected) {
                                  setCoValue(
                                    "categoryIds",
                                    current.filter((id) => id !== c.id),
                                    { shouldDirty: true },
                                  );
                                } else {
                                  setCoValue(
                                    "categoryIds",
                                    [...current, c.id],
                                    { shouldDirty: true },
                                  );
                                }
                              }}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                selected
                                  ? "border-emerald-500 bg-emerald-600 text-white"
                                  : "border-zinc-300 bg-transparent text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                              }`}
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                      {coErrors.categoryIds && (
                        <p className="mt-1 text-sm text-red-400">
                          {coErrors.categoryIds.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting || (!userDirty && !(linkedCompany && coDirty))
              }
              className={`flex w-full items-center justify-center gap-2 rounded py-2 ${
                !userDirty && !(linkedCompany && coDirty)
                  ? "cursor-not-allowed bg-gray-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              <Save size={16} />
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
