"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  employerCompanyFormSchema,
  type EmployerCompanyFormValues,
} from "@/app/validations/employer-company.schema";
import { employerPortalService } from "@/services/employer-portal.service";
import { useLocationStore } from "@/app/stores/location.store";
import UploadButton from "@/components/UploadButton";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Camera } from "lucide-react";
import { EmployerQueryError, EmployerQueryLoading } from "../employer-query-ui";
import { applyFieldErrorsToForm, resolveSubmitError } from "@/lib/submit-error";
import { STALE_EMPLOYER_FORM_META_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import Image from "next/image";
import OptionSelect from "@/components/ui/option-select";

export default function EmployerCompanyForm({
  variant = "page",
}: {
  variant?: "page" | "embedded";
}) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const {
    provinces,
    districtsMap,
    loadingDistrict,
    fetchProvinces,
    fetchDistricts,
  } = useLocationStore();

  const {
    data: meta,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employer-form-meta", userId],
    queryFn: () => employerPortalService.formMeta(),
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_FORM_META_MS,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployerCompanyFormValues>({
    resolver: zodResolver(employerCompanyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      website: "",
      logo: "",
      provinceId: 0,
      districtId: 0,
      categoryIds: [],
    },
  });

  const provinceId = useWatch({ control, name: "provinceId" });
  const logoPreview = useWatch({ control, name: "logo" });
  const categoryIds = useWatch({ control, name: "categoryIds" }) ?? [];

  useEffect(() => {
    void fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    if (!meta?.company) return;
    reset({
      name: meta.company.name,
      description: meta.company.description ?? "",
      location: meta.company.location,
      website: meta.company.website ?? "",
      logo: meta.company.logo ?? "",
      provinceId: meta.company.provinceId,
      districtId: meta.company.districtId,
      categoryIds: meta.selectedParentCategoryIds ?? [],
    });
    void fetchDistricts(meta.company.provinceId);
  }, [meta, reset, fetchDistricts]);

  useEffect(() => {
    if (!provinceId || provinceId < 1) return;
    void fetchDistricts(provinceId);
  }, [provinceId, fetchDistricts]);

  const districts = provinceId ? (districtsMap[provinceId] ?? []) : [];

  const toggleCategory = (id: number) => {
    const cur = categoryIds;
    if (cur.includes(id)) {
      setValue(
        "categoryIds",
        cur.filter((x) => x !== id),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue("categoryIds", [...cur, id], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (values: EmployerCompanyFormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        location: values.location.trim(),
        provinceId: values.provinceId,
        districtId: values.districtId,
        categoryIds: values.categoryIds,
        ...(values.description?.trim()
          ? { description: values.description.trim() }
          : {}),
        ...(values.website?.trim() ? { website: values.website.trim() } : {}),
        ...(values.logo?.trim() ? { logo: values.logo.trim() } : {}),
      };
      await employerPortalService.updateCompany(payload);
      toast.success("Đã lưu thông tin công ty");
      await qc.invalidateQueries({ queryKey: ["employer-form-meta"] });
      await qc.invalidateQueries({ queryKey: ["employer-portal-dashboard"] });
      await qc.invalidateQueries({ queryKey: ["employer-portal-me"] });
    } catch (e) {
      const { toastMessage, fieldErrors } = resolveSubmitError(e);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  if (userId == null || isPending) {
    return <EmployerQueryLoading label={"Đang tải…"} />;
  }

  if (isError || !meta) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const allCategories = meta.parentCategories ?? [];
  const companyLocked = meta.company.status === false;
  const isPage = variant === "page";

  const companyCoreFields = (
    <>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Tên công ty"}
          <span className="text-red-500"> *</span>
        </label>
        <input {...register("name")} className={inputClass} />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Giới thiệu"}
        </label>
        <textarea
          rows={4}
          {...register("description")}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Địa chỉ / khu vực"}
          <span className="text-red-500"> *</span>
        </label>
        <input {...register("location")} className={inputClass} />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">
            {errors.location.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Website"}
        </label>
        <input
          type="text"
          placeholder="https://"
          {...register("website")}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Tỉnh / Thành"}
            <span className="text-red-500"> *</span>
          </label>
          <Controller
            control={control}
            name="provinceId"
            render={({ field }) => (
              <OptionSelect
                ariaLabel="Tỉnh / Thành"
                placeholder="Chọn tỉnh / thành"
                value={field.value > 0 ? String(field.value) : ""}
                options={provinces.map((province) => ({
                  value: String(province.id),
                  label: province.name,
                }))}
                onChange={(next) => {
                  field.onChange(next ? Number(next) : 0);
                  setValue("districtId", 0, { shouldValidate: false });
                }}
              />
            )}
          />
          {errors.provinceId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.provinceId.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Quận / Huyện"}
            <span className="text-red-500"> *</span>
          </label>
          <Controller
            control={control}
            name="districtId"
            render={({ field }) => (
              <OptionSelect
                ariaLabel="Quận / Huyện"
                placeholder={loadingDistrict ? "Đang tải…" : "Chọn quận / huyện"}
                disabled={
                  !provinceId ||
                  provinceId < 1 ||
                  loadingDistrict ||
                  districts.length === 0
                }
                value={field.value > 0 ? String(field.value) : ""}
                options={districts.map((district) => ({
                  value: String(district.id),
                  label: district.name,
                }))}
                onChange={(next) => field.onChange(next ? Number(next) : 0)}
              />
            )}
          />
          {errors.districtId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.districtId.message as string}
            </p>
          )}
        </div>
      </div>
    </>
  );

  const companyLogoFields = (
    <div className="shrink-0">
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Logo công ty"}
        </label>
        <input type="hidden" {...register("logo")} />
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 p-3 dark:bg-white/5">
          <div className="group relative shrink-0">
            <Image
              src={logoPreview || "/images/logo-default.png"}
              alt=""
              width={64}
              height={64}
              className="logo-plate h-16 w-16 rounded-lg border border-zinc-200 bg-white object-contain"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/35 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton
              signatureEndpoint="/api/sign-cloudinary-params"
              className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-95"
              uploadPreset="F8_TopCV"
              options={{ tags: ["company-logo"] }}
              onSuccess={(results: CloudinaryUploadWidgetResults) => {
                const info = results?.info;
                const url =
                  typeof info === "object" && info !== null
                    ? info.secure_url
                    : undefined;
                if (url) {
                  setValue("logo", url, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            />
            {logoPreview?.trim() ? (
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                onClick={() =>
                  setValue("logo", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {"Xóa logo"}
              </button>
            ) : null}
          </div>
        </div>
        {errors.logo && (
          <p className="mt-1 text-sm text-red-600">{errors.logo.message}</p>
        )}
    </div>
  );

  const companyCategoriesFields = (
      <div className="space-y-2">
        <p className="mb-2 shrink-0 text-sm font-medium text-zinc-700">
          {"Danh mục ngành"}
          <span className="text-red-500"> *</span>
        </p>
        <div
          className="employer-category-scroll custom-scrollbar max-h-52 overscroll-y-contain overflow-y-auto rounded-xl border border-zinc-200 bg-white/90 p-2 pr-1.5 [scrollbar-gutter:stable]"
        >
          <div className="grid gap-1.5 sm:grid-cols-2">
            {allCategories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-primary/25"
                  checked={categoryIds.includes(c.id)}
                  onChange={() => toggleCategory(c.id)}
                />
                <span className="min-w-0 flex-1 text-left leading-snug text-zinc-800">
                  {c.name}
                </span>
              </label>
            ))}
          </div>
        </div>
        {errors.categoryIds && (
          <p className="mt-1 shrink-0 text-sm text-red-600">
            {errors.categoryIds.message as string}
          </p>
        )}
      </div>
  );

  const logoAndCategoriesFields = (
    <>
      {companyLogoFields}
      {companyCategoriesFields}
    </>
  );

  return (
    <div className="space-y-4">
      {companyLocked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
          {
            "Bạn không thể chỉnh sửa hồ sơ công ty khi công ty đang bị khóa. Xem thông báo phía trên hoặc liên hệ bộ phận hỗ trợ để biết chi tiết."
          }
        </div>
      ) : null}
      {variant === "embedded" && (
        <p className="text-sm text-zinc-600">
          {
            "Cập nhật hồ sơ công ty và chọn ít nhất một danh mục ngành để có thể chọn danh mục khi đăng tin."
          }
        </p>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl space-y-4"
      >
        <fieldset
          disabled={companyLocked}
          className="space-y-4 border-0 p-0 disabled:opacity-60"
        >
          {isPage ? (
            <div className="space-y-4">
              {companyLogoFields}
              {companyCoreFields}
              {companyCategoriesFields}
            </div>
          ) : (
            <div className="space-y-4">
              {companyCoreFields}
              {logoAndCategoriesFields}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || companyLocked}
            className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
          >
            Lưu thông tin công ty
          </button>
        </fieldset>
      </form>
    </div>
  );
}
