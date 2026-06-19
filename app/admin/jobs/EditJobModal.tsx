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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { updateJobSchema } from "@/app/validations/job.schema";
import {
  JOB_MODERATION_OPTIONS,
  SelectOption,
  Job,
} from "@/app/types/job.type";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { jobService } from "@/services/job.service";
import { categoryService } from "@/services/category.service";
import { employerService } from "@/services/employer.service";
import { formatCurrency, parseCurrency } from "@/utils/helper";
import { adminSkillsService } from "@/services/admin-skills.service";
import { ADMIN_MODAL_SELECT } from "@/lib/admin-ui";
import {
  applyFieldErrorsToForm,
  getErrorToastMessage,
  resolveSubmitError,
} from "@/lib/submit-error";

type FormData = z.input<typeof updateJobSchema>;

type SimpleItem = {
  id: number;
  name: string;
};

export default function EditJobModal({
  job,
  companies,
  jobTypeOptions,
  experienceOptions,
  onClose,
}: {
  job: Job;
  companies: SimpleItem[];
  jobTypeOptions: SelectOption[];
  experienceOptions: SelectOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [companyCategories, setCompanyCategories] = useState<SimpleItem[]>([]);
  const [employers, setEmployers] = useState<SimpleItem[]>([]);

  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingEmployer, setLoadingEmployer] = useState(false);
  const [skillOptions, setSkillOptions] = useState<
    { id: number; name: string }[]
  >([]);

  const [isInit, setIsInit] = useState(true);
  const [prevCompanyId, setPrevCompanyId] = useState<number | undefined>();

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(updateJobSchema),
  });

  const selectedCompanyId = useWatch({
    control,
    name: "companyId",
  }) as number | undefined;

  const skillIdsSelected = (useWatch({ control, name: "skillIds" }) ??
    []) as number[];

  const inputClass = ADMIN_MODAL_SELECT;

  useEffect(() => {
    if (!job) return;

    reset({
      title: job.title,
      description: job.description,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      quantity: job.quantity,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      companyId: job.companyId,
      categoryId: job.categoryId,
      employerId: job.employerId ?? undefined,
      moderationStatus: job.moderationStatus ?? "PENDING",
      deadline: job.deadline ? job.deadline.slice(0, 16) : "",
      workLocation: job.workLocation ?? "",
      isFeatured: job.isFeatured ?? false,
      skillIds: job.jobSkills?.map((js) => js.skill.id) ?? [],
    });

    setIsInit(true);
    setPrevCompanyId(job.companyId);
  }, [job, reset]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminSkillsService.selectAll();
        if (!cancelled) setSkillOptions(list);
      } catch (e) {
        toast.error(
          getErrorToastMessage(e) || "Không tải được danh sách kỹ năng",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) {
      setCompanyCategories([]);
      setEmployers([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingCategory(true);
        setLoadingEmployer(true);

        const [categories, employerList] = await Promise.all([
          categoryService.getCategoriesByCompany(+selectedCompanyId),
          employerService.getByCompany(+selectedCompanyId),
        ]);

        setCompanyCategories(categories || []);
        setEmployers(employerList || []);
      } catch (e) {
        toast.error(
          getErrorToastMessage(e) || "Không tải được dữ liệu công ty",
        );
      } finally {
        setLoadingCategory(false);
        setLoadingEmployer(false);
      }
    };

    fetchData();
  }, [selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompanyId) return;

    if (isInit) {
      const categoryExists = companyCategories.some(
        (item) => item.id === job.categoryId,
      );

      const employerExists = employers.some(
        (item) => item.id === job.employerId,
      );

      if (categoryExists) {
        setValue("categoryId", job.categoryId);
      }

      if (employerExists) {
        setValue("employerId", job.employerId ?? undefined);
      }

      if (companyCategories.length > 0 && employers.length >= 0) {
        setIsInit(false);
      }

      return;
    }

    if (prevCompanyId !== selectedCompanyId) {
      setValue("categoryId", undefined);
      setValue("employerId", undefined);
      setPrevCompanyId(selectedCompanyId);
    }
  }, [
    selectedCompanyId,
    companyCategories,
    employers,
    isInit,
    job.categoryId,
    job.employerId,
    prevCompanyId,
    setValue,
  ]);

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

  const onSubmit: SubmitHandler<FormData> = async (rawData) => {
    const data = updateJobSchema.parse(rawData);

    try {
      await jobService.updateJob(job.id, {
        ...data,
        employerId: data.employerId || undefined,
        ...(rawData.deadline === "" ? { deadline: null } : {}),
        ...(rawData.workLocation === "" ? { workLocation: null } : {}),
      });

      await invalidatePublicJobListQueries(queryClient);
      toast.success("Cập nhật việc làm thành công");
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
      <DialogContent className="bg-[#1e1e1e] text-white border border-gray-700 min-w-3xl max-h-[min(92vh,900px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Chỉnh sửa việc làm
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-3">
          <div>
            <label className="mb-1 block text-sm text-gray-300">Tiêu đề</label>
            <input
              {...register("title")}
              className={inputClass}
              placeholder="Nhập tiêu đề việc làm"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Mô tả</label>
            <textarea
              rows={5}
              {...register("description")}
              className={`min-h-50 ${inputClass}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Công ty
              </label>
              <select
                {...register("companyId", {
                  setValueAs: (v) => (v ? Number(v) : undefined),
                })}
                className={inputClass}
              >
                <option value="">-- Chọn công ty --</option>
                {companies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Nhà tuyển dụng
              </label>

              <select
                disabled={!selectedCompanyId || loadingEmployer}
                {...register("employerId", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                className={inputClass}
              >
                {!selectedCompanyId ? (
                  <option value="">-- Chọn công ty trước --</option>
                ) : loadingEmployer ? (
                  <option value="">Đang tải...</option>
                ) : (
                  <>
                    <option value="">Admin</option>

                    {employers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Danh mục</label>
            {!selectedCompanyId ? (
              <p className="text-sm text-gray-500">
                Chọn công ty để xem danh mục.
              </p>
            ) : loadingCategory ? (
              <p className="text-sm text-gray-500">Đang tải danh mục…</p>
            ) : companyCategories.length === 0 ? (
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
                      {companyCategories.map((item) => {
                        const on = field.value === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() =>
                              field.onChange(on ? undefined : item.id)
                            }
                            className={`rounded-md border px-2 py-1.5 text-left text-sm transition ${
                              on
                                ? "border-violet-500 bg-violet-600/30 text-white"
                                : "border-gray-600 text-gray-300 hover:bg-gray-700/60"
                            }`}
                          >
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            )}
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <label className="block text-sm mb-1 text-gray-400">Mức lương</label>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="minSalary"
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Lương tối thiểu"
                  className={inputClass}
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
                  className={inputClass}
                  value={formatCurrency(field.value as number)}
                  onChange={(e) =>
                    field.onChange(parseCurrency(e.target.value))
                  }
                />
              )}
            />
          </div>
          {errors.minSalary && (
            <p className="text-red-400 text-sm">{errors.minSalary.message}</p>
          )}

          {errors.maxSalary && (
            <p className="text-red-400 text-sm">{errors.maxSalary.message}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-0">
            <label className="block text-sm mb-1 text-gray-400">
              Hình thức
            </label>
            <label className="block text-sm mb-1 text-gray-400">Cấp bậc</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select {...register("jobType")} className={inputClass}>
              {jobTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select {...register("experienceLevel")} className={inputClass}>
              {experienceOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <label className="block text-sm mb-1 text-gray-400">
            Số lượng cần tuyển
          </label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className={inputClass}
            placeholder="Số lượng tuyển"
          />

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Trạng thái duyệt
            </label>
            <select {...register("moderationStatus")} className={inputClass}>
              {JOB_MODERATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Hạn nộp hồ sơ
            </label>
            <input
              type="datetime-local"
              {...register("deadline")}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Địa điểm làm việc
            </label>
            <input
              {...register("workLocation")}
              className={inputClass}
              placeholder="VD: Hà Nội / Hybrid..."
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="rounded"
            />
            Việc làm nổi bật
          </label>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Kỹ năng</label>
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
                      className="flex min-w-0 cursor-pointer items-center gap-2 text-sm"
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-medium transition ${
              !isDirty
                ? "cursor-not-allowed bg-gray-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <Save size={16} />
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật việc làm"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
