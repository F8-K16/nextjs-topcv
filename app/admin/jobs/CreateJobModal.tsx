"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { createJobSchema } from "@/app/validations/job.schema";
import { JOB_MODERATION_OPTIONS } from "@/app/types/job.type";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { jobService } from "@/services/job.service";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { adminSkillsService } from "@/services/admin-skills.service";
import { formatCurrency, parseCurrency } from "@/utils/helper";
import { ADMIN_MODAL_SELECT } from "@/lib/admin-ui";
import {
  applyFieldErrorsToForm,
  getErrorToastMessage,
  resolveSubmitError,
} from "@/lib/submit-error";

type FormData = z.input<typeof createJobSchema>;

export default function CreateJobModal({
  onClose,
  companies,
  categories,
  companyId,
  employerId,
  jobTypeOptions,
  experienceOptions,
}: {
  onClose: () => void;
  companies: {
    id: number;
    name: string;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
  companyId?: number;
  employerId?: number;
  jobTypeOptions: { value: string; label: string }[];
  experienceOptions: { value: string; label: string }[];
}) {
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [skillOptions, setSkillOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      quantity: 1,
      jobType: "FULL_TIME",
      companyId: companyId ?? undefined,
      employerId: employerId ?? undefined,
      moderationStatus: "APPROVED",
      deadline: "",
      workLocation: "",
      isFeatured: false,
      skillIds: [] as number[],
    },
  });

  const selectedCompanyId = useWatch({ control, name: "companyId" });
  const skillIdsSelected = useWatch({ control, name: "skillIds" }) ?? [];

  const onSubmit: SubmitHandler<FormData> = async (rawData) => {
    const data = createJobSchema.parse(rawData);
    try {
      const payload = {
        ...data,
      };

      await jobService.createJob(payload);

      await invalidatePublicJobListQueries(queryClient);
      toast.success("Tạo việc làm thành công");
      onClose();
      router.refresh();
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchCategories = async () => {
      try {
        const data =
          await categoryService.getCategoriesByCompany(+selectedCompanyId);
        setFilteredCategories(data);
      } catch (error) {
        toast.error(getErrorToastMessage(error) || "Không tải được danh mục");
      }
    };

    fetchCategories();
  }, [selectedCompanyId]);

  useEffect(() => {
    setValue("categoryId", undefined);
  }, [selectedCompanyId, setValue]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminSkillsService.selectAll();
        if (!cancelled) setSkillOptions(list);
      } catch (error) {
        toast.error(
          getErrorToastMessage(error) || "Không tải được danh sách kỹ năng",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSkill = (skillId: number) => {
    const cur = skillIdsSelected;
    if (cur.includes(skillId)) {
      setValue(
        "skillIds",
        cur.filter((id) => id !== skillId),
        { shouldDirty: true, shouldValidate: true },
      );
    } else {
      setValue("skillIds", [...cur, skillId], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#1e1e1e] text-white border border-gray-700 min-w-3xl max-h-[min(92vh,900px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo việc làm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <label className="block text-sm mb-1 text-gray-400">Tiêu đề</label>
          <input
            placeholder="Nhập tiêu đề công việc..."
            {...register("title")}
            className="w-full p-2 bg-[#2f2f2f] rounded"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1 leading-tight">
              {errors.title.message}
            </p>
          )}

          <label className="block text-sm mb-1 text-gray-400">Mô tả</label>
          <textarea
            rows={5}
            placeholder="Nhập mô tả công việc..."
            {...register("description")}
            className="w-full p-2 bg-[#2f2f2f] rounded min-h-50"
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1 leading-tight">
              {errors.description.message}
            </p>
          )}

          <label className="block text-sm mb-1 text-gray-400">Công ty</label>
          <select
            className={ADMIN_MODAL_SELECT}
            {...register("companyId", {
              setValueAs: (v) => (v ? Number(v) : undefined),
            })}
          >
            <option value="">-- Chọn công ty --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <p className="text-red-400 text-sm">{errors.companyId.message}</p>
          )}

          <label className="block text-sm mb-1 text-gray-400">Danh mục</label>
          {!selectedCompanyId ? (
            <p className="text-sm text-gray-500">
              Chọn công ty để xem danh mục.
            </p>
          ) : filteredCategories.length === 0 ? (
            <p className="text-sm text-amber-400/90">
              Công ty chưa gán danh mục nào.
            </p>
          ) : (
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <div className="max-h-40 overflow-y-auto overscroll-y-contain rounded-md border border-gray-600/60 bg-[#2a2a2a] p-2 pr-1.5 [scrollbar-gutter:stable]">
                  <div className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[800px]:grid-cols-3 gap-1.5">
                    {filteredCategories.map((c) => {
                      const on = field.value === c.id;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => field.onChange(on ? undefined : c.id)}
                          className={`rounded-md border px-2 py-1.5 text-left text-sm transition ${
                            on
                              ? "border-violet-500 bg-violet-600/30 text-white"
                              : "border-gray-600 text-gray-300 hover:bg-gray-700/60"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            />
          )}
          {errors.categoryId && (
            <p className="text-red-400 text-sm mt-1 leading-tight">
              {errors.categoryId.message}
            </p>
          )}

          <label className="block text-sm mb-1 text-gray-400">Mức lương</label>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="minSalary"
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Lương tối thiểu"
                  className="p-2 bg-[#2f2f2f] rounded"
                  value={formatCurrency(field.value as number)}
                  onChange={(e) =>
                    field.onChange(parseCurrency(e.target.value))
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="maxSalary"
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Lương tối đa"
                  className="p-2 bg-[#2f2f2f] rounded"
                  value={formatCurrency(field.value as number)}
                  onChange={(e) =>
                    field.onChange(parseCurrency(e.target.value))
                  }
                />
              )}
            />
          </div>
          {errors.maxSalary && (
            <p className="text-red-400 text-sm mt-1 leading-tight">
              {errors.maxSalary.message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm mb-1 text-gray-400">
              Hình thức
            </label>
            <label className="block text-sm mb-1 text-gray-400">Trình độ</label>
          </div>
          <div className="grid grid-cols-2 gap-3 -mt-3">
            <select {...register("jobType")} className={ADMIN_MODAL_SELECT}>
              {jobTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              {...register("experienceLevel")}
              className={ADMIN_MODAL_SELECT}
            >
              {experienceOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {errors.jobType && (
              <p className="text-red-400 text-sm leading-tight">
                {errors.jobType!.message}
              </p>
            )}
            {errors.experienceLevel && (
              <p className="text-red-400 text-sm leading-tight">
                {errors.experienceLevel!.message}
              </p>
            )}
          </div>

          <label className="block text-sm mb-1 text-gray-400">
            Số lượng cần tuyển
          </label>
          <input
            type="number"
            {...register("quantity")}
            className="w-full p-2 bg-[#2f2f2f] rounded"
          />
          {errors.quantity && (
            <p className="text-red-400 text-sm mt-1 leading-tight">
              {errors.quantity.message}
            </p>
          )}

          <label className="block text-sm mb-1 text-gray-400">
            Trạng thái duyệt
          </label>
          <select
            {...register("moderationStatus")}
            className={ADMIN_MODAL_SELECT}
          >
            {JOB_MODERATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <label className="block text-sm mb-1 text-gray-400">
            Hạn nộp hồ sơ
          </label>
          <input
            type="datetime-local"
            {...register("deadline")}
            className="w-full p-2 bg-[#2f2f2f] rounded"
          />

          <label className="block text-sm mb-1 text-gray-400">
            Địa điểm làm việc
          </label>
          <input
            placeholder="VD: Hà Nội / Hybrid..."
            {...register("workLocation")}
            className="w-full p-2 bg-[#2f2f2f] rounded"
          />
          {errors.workLocation && (
            <p className="text-red-400 text-sm mt-1 leading-tight">
              {errors.workLocation.message}
            </p>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="rounded"
            />
            Việc làm nổi bật
          </label>

          <label className="block text-sm mb-1 text-gray-400">Kỹ năng</label>
          <p className="text-xs text-gray-500 mb-1.5">
            Chọn các kỹ năng cần có của công việc.
          </p>
          <div className="max-h-48 overflow-y-auto overscroll-y-contain rounded-md border border-gray-600/60 bg-[#2a2a2a] p-2 pr-1.5 [scrollbar-gutter:stable]">
            {skillOptions.length === 0 ? (
              <p className="text-xs text-gray-500">
                Đang tải hoặc chưa có kỹ năng
              </p>
            ) : (
              <div className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[800px]:grid-cols-3 gap-x-3 gap-y-1.5 content-start min-h-0">
                {skillOptions.map((s) => (
                  <label
                    key={s.id}
                    className="flex min-w-0 items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="shrink-0 rounded"
                      checked={skillIdsSelected.includes(s.id)}
                      onChange={() => toggleSkill(s.id)}
                    />
                    <span className="truncate" title={s.name}>
                      {s.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {employerId && (
            <input
              type="hidden"
              value={employerId}
              {...register("employerId", { valueAsNumber: true })}
            />
          )}

          <button
            disabled={isSubmitting}
            className="w-full bg-blue-500 py-2 rounded flex justify-center gap-2"
          >
            <Check size={16} />
            {isSubmitting ? "Đang tạo..." : "Tạo mới"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
