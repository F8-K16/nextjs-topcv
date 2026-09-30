"use client";

import { createCompanySchema } from "@/app/validations/company.schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { companyService } from "@/services/company.service";
import { locationService } from "@/services/location.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  applyFieldErrorsToForm,
  getErrorToastMessage,
  resolveSubmitError,
} from "@/lib/submit-error";
import {
  adminDialogSurface,
  adminInput,
  adminLabel,
  adminPickerBox,
  adminTagActive,
  adminTagIdle,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof createCompanySchema>;

export default function CreateCompanyModal({
  onClose,
  provinces,
  categories,
}: {
  onClose: () => void;
  provinces: { id: number; name: string }[];
  categories: { id: number; name: string; parentId?: number | null }[];
}) {
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const router = useRouter();

  const parentCategories = useMemo(
    () => categories.filter((c) => (c.parentId ?? null) == null),
    [categories],
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      categoryIds: [],
    },
  });

  const provinceId = watch("provinceId");

  const onSubmit = async (data: FormData) => {
    try {
      await companyService.createCompany(data);
      toast.success("Tạo công ty thành công");

      onClose();
      router.refresh();
    } catch (err) {
      const { toastMessage, fieldErrors } = resolveSubmitError(err);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  useEffect(() => {
    if (!provinceId) {
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={cn("min-w-3xl max-h-[min(90vh,720px)] overflow-y-auto border", adminDialogSurface)}>
        <DialogHeader>
          <DialogTitle>Tạo công ty</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className={adminLabel}>
              Tên công ty
            </label>
            <input
              {...register("name")}
              placeholder="Nhập tên công ty..."
              className={adminInput}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1 leading-tight">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className={adminLabel}>Website</label>
            <input
              {...register("website")}
              placeholder="Nhập địa chỉ website..."
              className={adminInput}
            />
            {errors.website && (
              <p className="text-red-400 text-sm mt-1 leading-tight">
                {errors.website.message}
              </p>
            )}
          </div>

          <div>
            <label className={adminLabel}>Mô tả</label>
            <textarea
              {...register("description")}
              placeholder="Nhập mô tả công ty..."
              className={cn(adminInput, "min-h-40")}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1 leading-tight">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className={adminLabel}>Địa chỉ</label>
            <input
              {...register("location")}
              placeholder="Nhập địa chỉ (vd: số nhà, tên đường,....)"
              className={adminInput}
            />
            {errors.location && (
              <p className="text-red-400 text-sm mt-1 leading-tight">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={adminLabel}>
                Tỉnh/Thành phố
              </label>
              <select
                {...register("provinceId", {
                  setValueAs: (v) => (v ? Number(v) : undefined),
                })}
                className={adminInput}
              >
                <option value="">-- Chọn tỉnh/thành phố --</option>
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
              <label className={adminLabel}>
                Quận/Huyện
              </label>
              <select
                {...register("districtId", {
                  setValueAs: (v) => (v ? Number(v) : undefined),
                })}
                disabled={!provinceId || loadingDistrict}
                className={cn(adminInput, "disabled:opacity-50")}
              >
                <option value="">
                  {loadingDistrict ? "Đang tải..." : "-- Chọn quận/huyện --"}
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
            <p className={adminLabel}>Lĩnh vực</p>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
              Chọn nhiều các lĩnh vực của công ty.
            </p>
            <div className={cn(adminPickerBox, "max-h-44")}>
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
                      className={selected ? adminTagActive : adminTagIdle}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {errors.categoryIds && (
              <p className="text-red-400 text-sm mt-1 leading-tight">
                {errors.categoryIds.message}
              </p>
            )}
          </div>
          <button
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {isSubmitting ? "Đang tạo..." : "Tạo mới"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
