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
          rows={isPage ? 9 : 4}
          {...register("description")}
          className={`${inputClass} ${isPage ? "min-h-52 resize-y" : ""}`}
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
              <select
                className={inputClass}
                value={field.value > 0 ? field.value : ""}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : 0;
                  field.onChange(v);
                  setValue("districtId", 0, { shouldValidate: false });
                }}
              >
                <option value="">{"-- Chọn --"}</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
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
              <select
                className={inputClass}
                disabled={
                  !provinceId ||
                  provinceId < 1 ||
                  loadingDistrict ||
                  districts.length === 0
                }
                value={field.value > 0 ? field.value : ""}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : 0;
                  field.onChange(v);
                }}
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
        <p className="mb-2 text-xs text-zinc-500">
          {
            "JPG, PNG hoặc WEBP. Hình vuông sẽ đẹp nhất (cùng cấu hình ảnh đại diện)."
          }
        </p>
        <input type="hidden" {...register("logo")} />
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-zinc-200 bg-linear-to-b from-zinc-50 to-white p-4 sm:flex-row sm:items-center">
          <div className="group relative shrink-0">
            <Image
              src={logoPreview || "/images/logo-default.png"}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded-xl border border-zinc-200 object-contain"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/35 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton
              signatureEndpoint="/api/sign-cloudinary-params"
              className="cursor-pointer rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-95"
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
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
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
      <div
        className={
          isPage ? "flex min-h-0 flex-1 flex-col" : "space-y-2"
        }
      >
        <p className="mb-2 shrink-0 text-sm font-medium text-zinc-700">
          {"Danh mục ngành của công ty"}
          <span className="text-red-500"> *</span>
        </p>
        <p className="mb-2 shrink-0 text-xs text-zinc-500">
          {
            "Chọn ít nhất một mục. Các danh mục này dùng để đăng tin việc làm thuộc đúng ngành công ty."
          }
        </p>
        <div
          className={`employer-category-scroll custom-scrollbar overscroll-y-contain overflow-y-auto rounded-xl border border-zinc-200 bg-white/90 p-2 pr-1.5 shadow-inner [scrollbar-gutter:stable] ${
            isPage
              ? "min-h-0 flex-1 lg:max-h-none"
              : "max-h-64"
          }`}
        >
          <div
            className={
              isPage
                ? "flex flex-col gap-2"
                : "grid gap-2 sm:grid-cols-2"
            }
          >
            {allCategories.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50/90 px-3 py-2.5 text-sm transition hover:border-primary/30 hover:bg-white"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-primary/25"
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
        className={isPage ? "w-full space-y-6" : "max-w-3xl space-y-4"}
      >
        <fieldset
          disabled={companyLocked}
          className="space-y-4 border-0 p-0 disabled:opacity-60"
        >
          {isPage ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(26rem,100%)] lg:items-stretch xl:grid-cols-[minmax(0,1fr)_min(30rem,38%)]">
              <div className="min-w-0 space-y-4">{companyCoreFields}</div>
              <div className="flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-4 lg:h-full lg:min-h-0 lg:bg-white lg:p-5 lg:shadow-sm lg:ring-1 lg:ring-zinc-100">
                {companyLogoFields}
                {companyCategoriesFields}
              </div>
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
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            Lưu thông tin công ty
          </button>
        </fieldset>
      </form>
    </div>
  );
}
