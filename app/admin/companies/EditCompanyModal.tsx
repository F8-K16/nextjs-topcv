"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateCompanySchema } from "@/app/validations/company.schema";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Company } from "@/app/types/company.type";
import { companyService } from "@/services/company.service";
import { locationService } from "@/services/location.service";
import {
  applyFieldErrorsToForm,
  getErrorToastMessage,
  resolveSubmitError,
} from "@/lib/submit-error";

type FormData = z.infer<typeof updateCompanySchema>;

export default function EditCompanyModal({
  company,
  provinces,
  categories,
  onClose,
}: {
  company: Company;
  provinces: { id: number; name: string }[];
  categories: { id: number; name: string; parentId?: number | null }[];
  onClose: () => void;
}) {
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [isInit, setIsInit] = useState<boolean>(true);
  const router = useRouter();
  const [loadingDistrict, setLoadingDistrict] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(updateCompanySchema),
  });

  const provinceId = watch("provinceId");
  const parentCategories = useMemo(
    () => categories.filter((c) => (c.parentId ?? null) == null),
    [categories],
  );

  useEffect(() => {
    if (!company) return;

    reset({
      name: company.name,
      description: company.description || "",
      location: company.location,
      website: company.website || "",
      logo: company.logo || "",
      status: company.status,
      provinceId: company.provinceId,
      districtId: company.districtId,
      categoryIds: company.categories?.map((c) => c.category.id) || [],
    });

    setIsInit(true);
  }, [company, reset]);

  useEffect(() => {
    if (typeof provinceId !== "number") {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistrict(true);
      try {
        const data = await locationService.getDistrictsByProvince(provinceId);
        setDistricts(data);
      } catch (error) {
        toast.error(getErrorToastMessage(error) || "Không tải được quận/huyện");
      } finally {
        setLoadingDistrict(false);
      }
    };

    fetchDistricts();
  }, [provinceId]);

  useEffect(() => {
    if (isInit && districts.length > 0 && company?.districtId) {
      const exists = districts.some((d) => d.id === company.districtId);

      if (exists) {
        setValue("districtId", company.districtId);
      }
      setIsInit(false);
    }
  }, [districts, isInit, company?.districtId, setValue]);

  useEffect(() => {
    if (isInit) return;

    setValue("districtId", 0);
  }, [isInit, provinceId, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await companyService.updateCompany(company.id, data);

      toast.success("Cập nhật công ty thành công");
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
      <DialogContent className="bg-[#1e1e1e] text-white border border-gray-700 min-w-2xl max-h-[min(90vh,720px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa công ty</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">
              Tên công ty
            </label>
            <input
              {...register("name")}
              className="w-full p-2 bg-[#2f2f2f] rounded"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">Website</label>
            <input
              {...register("website")}
              className="w-full p-2 bg-[#2f2f2f] rounded"
            />
            {errors.website && (
              <p className="text-red-400 text-sm mt-1">
                {errors.website.message}
              </p>
            )}
          </div>

          <label className="block text-sm mb-1 text-gray-400">Địa chỉ</label>
          <div>
            <input
              {...register("location")}
              className="w-full p-2 bg-[#2f2f2f] rounded"
            />
            {errors.location && (
              <p className="text-red-400 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-400">
                Tỉnh/Thành phố
              </label>
              <select
                {...register("provinceId", {
                  setValueAs: (v) => (v ? Number(v) : undefined),
                })}
                className="w-full p-2 bg-[#2f2f2f] rounded"
              >
                <option value="">-- Tỉnh/Thành --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.provinceId && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.provinceId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">
                Quận/Huyện
              </label>
              <select
                {...register("districtId", {
                  setValueAs: (v) => (v ? Number(v) : undefined),
                })}
                value={watch("districtId") || ""}
                disabled={!provinceId || loadingDistrict}
                className="w-full p-2 bg-[#2f2f2f] rounded disabled:opacity-50"
              >
                <option value="">
                  {loadingDistrict ? "Đang tải..." : "-- Quận/Huyện --"}
                </option>

                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.districtId && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.districtId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm mb-1 text-gray-400">Lĩnh vực</p>
            <p className="text-xs text-gray-500 mb-2">
              Chọn các lĩnh vực của công ty.
            </p>
            <div className="max-h-44 overflow-y-auto overscroll-y-contain rounded-md border border-gray-600/60 bg-[#2a2a2a] p-2 pr-1.5 [scrollbar-gutter:stable]">
              <div className="flex flex-wrap gap-2 content-start min-h-0">
                {parentCategories.map((c) => {
                  const selected = watch("categoryIds")?.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => {
                        const current = watch("categoryIds") || [];

                        if (selected) {
                          setValue(
                            "categoryIds",
                            current.filter((id) => id !== c.id),
                            { shouldDirty: true },
                          );
                        } else {
                          setValue("categoryIds", [...current, c.id], {
                            shouldDirty: true,
                          });
                        }
                      }}
                      className={`shrink-0 px-3 py-1 rounded-full text-sm border transition ${
                        selected
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">
              Trạng thái
            </label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <select
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                  className="w-full p-2 bg-[#2f2f2f] rounded"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Ngừng hoạt động</option>
                </select>
              )}
            />
            {errors.status && (
              <p className="text-red-400 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded ${
              !isDirty
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <Save size={16} />
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
