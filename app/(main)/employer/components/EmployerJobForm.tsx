"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  employerJobFormSchema,
  employerJobFormUpdateSchema,
} from "@/app/validations/job.schema";
import { JOB_TYPE_OPTIONS, EXPERIENCE_OPTIONS } from "@/app/types/job.type";
import { invalidateEmployerPortalJobQueries } from "@/lib/employer-portal-queries";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { employerPortalService } from "@/services/employer-portal.service";
import { formatCurrency, parseCurrency } from "@/utils/helper";
import type { Job } from "@/app/types/job.type";
import {
  applyFieldErrorsToForm,
  resolveSubmitError,
} from "@/lib/submit-error";
import { STALE_EMPLOYER_FORM_META_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";

function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function EmployerJobForm({
  mode,
  jobId,
  initialJob,
}: {
  mode: "create" | "edit";
  jobId?: number;
  initialJob?: Job;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: meta, isLoading: metaLoading } = useQuery({
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
  } = useForm({
    resolver: zodResolver(
      mode === "create"
        ? employerJobFormSchema
        : employerJobFormUpdateSchema,
    ),
    defaultValues: {
      title: "",
      description: "",
      quantity: 1,
      skillIds: [],
    },
  });

  const skillIds = useWatch({ control, name: "skillIds" }) ?? [];

  useEffect(() => {
    if (mode !== "edit" || !initialJob) return;
    reset({
      title: initialJob.title,
      description: initialJob.description,
      minSalary: initialJob.minSalary,
      maxSalary: initialJob.maxSalary,
      quantity: initialJob.quantity,
      jobType: initialJob.jobType,
      experienceLevel: initialJob.experienceLevel,
      categoryId: initialJob.categoryId,
      deadline: toDatetimeLocal(initialJob.deadline) || undefined,
      workLocation: initialJob.workLocation ?? undefined,
      skillIds: initialJob.jobSkills?.map((x) => x.skill.id) ?? [],
    });
  }, [mode, initialJob, reset]);

  const categories = meta?.categories ?? [];
  const skills = meta?.skills ?? [];
  const canSubmitCreate = mode !== "create" || categories.length > 0;
  const companyLocked = meta?.company?.status === false;

  const toggleSkill = (id: number) => {
    const cur = skillIds;
    if (cur.includes(id)) {
      setValue(
        "skillIds",
        cur.filter((x) => x !== id),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue("skillIds", [...cur, id], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (raw: Record<string, unknown>) => {
    try {
      const parsed =
        mode === "create"
          ? employerJobFormSchema.parse(raw)
          : employerJobFormUpdateSchema.parse(raw);

      const payload: Record<string, unknown> = { ...parsed };
      if (payload.deadline === "" || payload.deadline == null) {
        payload.deadline = null;
      }

      if (mode === "create") {
        await employerPortalService.createJob(payload);
        await invalidatePublicJobListQueries(queryClient);
        await invalidateEmployerPortalJobQueries(queryClient);
        toast.success("Đã gửi tin để duyệt");
        router.push("/employer/jobs");
        router.refresh();
      } else if (jobId != null) {
        await employerPortalService.updateJob(jobId, payload);
        await invalidatePublicJobListQueries(queryClient);
        await invalidateEmployerPortalJobQueries(queryClient, {
          updatedJobId: jobId,
        });
        toast.success("Đã cập nhật tin");
        router.push("/employer/jobs");
        router.refresh();
      }
    } catch (e) {
      const { toastMessage, fieldErrors } = resolveSubmitError(e);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  if (metaLoading || !meta) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        {"Đang tải biểu mẫu…"}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {companyLocked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          {
            "Công ty đang bị khóa — bạn không thể gửi hoặc sửa tin tuyển dụng. Liên hệ bộ phận hỗ trợ nếu cần thêm thông tin."
          }
        </div>
      ) : null}
      {mode === "create" && categories.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {
            "Công ty chưa có danh mục ngành. Vui lòng lưu ít nhất một danh mục ở mục \"Thông tin công ty\" phía trên (hoặc tại trang Hồ sơ công ty) trước khi gửi tin."
          }
        </div>
      )}
      <fieldset
        disabled={companyLocked}
        className="space-y-4 border-0 p-0 disabled:opacity-60"
      >
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Tiêu đề"}
        </label>
        <input {...register("title")} className={inputClass} />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Mô tả"}
        </label>
        <textarea
          rows={8}
          {...register("description")}
          className={inputClass}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Danh mục"}
        </label>
        <select
          {...register("categoryId", {
            setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
          })}
          className={inputClass}
        >
          <option value="">{"-- Chọn --"}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.categoryId.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Hình thức"}
          </label>
          <select {...register("jobType")} className={inputClass}>
            {JOB_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Kinh nghiệm"}
          </label>
          <select {...register("experienceLevel")} className={inputClass}>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Lương tối thiểu"}
          </label>
          <Controller
            control={control}
            name="minSalary"
            render={({ field }) => (
              <input
                type="text"
                inputMode="numeric"
                className={inputClass}
                value={formatCurrency(field.value as number)}
                onChange={(e) => field.onChange(parseCurrency(e.target.value))}
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Lương tối đa"}
          </label>
          <Controller
            control={control}
            name="maxSalary"
            render={({ field }) => (
              <input
                type="text"
                inputMode="numeric"
                className={inputClass}
                value={formatCurrency(field.value as number)}
                onChange={(e) => field.onChange(parseCurrency(e.target.value))}
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Số lượng"}
        </label>
        <input
          type="number"
          {...register("quantity", { valueAsNumber: true })}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Hạn nộp hồ sơ"}
        </label>
        <input type="datetime-local" {...register("deadline")} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          {"Địa điểm làm việc"}
        </label>
        <input {...register("workLocation")} className={inputClass} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700">
          {"Kỹ năng"}
        </p>
        <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {skills.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={skillIds.includes(s.id)}
                  onChange={() => toggleSkill(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting || !canSubmitCreate || companyLocked
        }
        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
      >
        {mode === "create"
          ? "Gửi tin để duyệt"
          : "Lưu thay đổi"}
      </button>
      </fieldset>
    </form>
  );
}
