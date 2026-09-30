"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
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
  getErrorToastMessage,
  resolveSubmitError,
} from "@/lib/submit-error";
import { STALE_EMPLOYER_FORM_META_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import OptionSelect from "@/components/ui/option-select";

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
  const [skillSearch, setSkillSearch] = useState("");
  const [extraSkills, setExtraSkills] = useState<
    { id: number; name: string }[]
  >([]);
  const debouncedSkillSearch = useDebounce(skillSearch, 250);

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
  const skills = useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    for (const skill of meta?.skills ?? []) map.set(skill.id, skill);
    for (const skill of extraSkills) map.set(skill.id, skill);
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "vi"),
    );
  }, [meta?.skills, extraSkills]);

  const { data: searchedSkills } = useQuery({
    queryKey: ["employer-portal-skills", userId, debouncedSkillSearch],
    queryFn: () => employerPortalService.listSkills(debouncedSkillSearch),
    enabled: userId != null && debouncedSkillSearch.trim().length > 0,
    staleTime: 30_000,
  });

  const visibleSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return skills;
    const fromSearch = searchedSkills?.skills ?? [];
    const map = new Map<number, { id: number; name: string }>();
    for (const skill of skills) {
      if (skill.name.toLowerCase().includes(q)) map.set(skill.id, skill);
    }
    for (const skill of fromSearch) map.set(skill.id, skill);
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "vi"),
    );
  }, [skillSearch, skills, searchedSkills]);

  const exactSkillMatch = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return null;
    return (
      visibleSkills.find((skill) => skill.name.toLowerCase() === q) ?? null
    );
  }, [skillSearch, visibleSkills]);

  const canCreateSkill =
    skillSearch.trim().length > 0 && exactSkillMatch == null;

  const createSkillMut = useMutation({
    mutationFn: (name: string) => employerPortalService.createSkill(name),
    onSuccess: async (skill) => {
      setExtraSkills((prev) =>
        prev.some((item) => item.id === skill.id) ? prev : [...prev, skill],
      );
      if (!skillIds.includes(skill.id)) {
        setValue("skillIds", [...skillIds, skill.id], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      setSkillSearch("");
      toast.success(`Đã thêm kỹ năng "${skill.name}"`);
      await queryClient.invalidateQueries({
        queryKey: ["employer-form-meta"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["employer-portal-skills"],
      });
    },
    onError: (error) => {
      toast.error(getErrorToastMessage(error) || "Không tạo được kỹ năng");
    },
  });

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
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <OptionSelect
              ariaLabel="Danh mục"
              placeholder="-- Chọn --"
              value={field.value ? String(field.value) : ""}
              options={categories.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
              onChange={(next) =>
                field.onChange(next ? Number(next) : undefined)
              }
            />
          )}
        />
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
          <Controller
            control={control}
            name="jobType"
            render={({ field }) => (
              <OptionSelect
                ariaLabel="Hình thức"
                allowClear={false}
                placeholder="Chọn hình thức"
                value={field.value ?? ""}
                options={JOB_TYPE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {"Kinh nghiệm"}
          </label>
          <Controller
            control={control}
            name="experienceLevel"
            render={({ field }) => (
              <OptionSelect
                ariaLabel="Kinh nghiệm"
                allowClear={false}
                placeholder="Chọn kinh nghiệm"
                value={field.value ?? ""}
                options={EXPERIENCE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                onChange={field.onChange}
              />
            )}
          />
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
        <p className="mb-2 text-sm font-medium text-zinc-700">{"Kỹ năng"}</p>
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Tìm kỹ năng…"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {skillIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((skill) => skillIds.includes(skill.id))
                .map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className="inline-flex items-center rounded-full bg-[#00b14f]/10 px-2.5 py-1 text-xs font-semibold text-[#087a38] hover:bg-[#00b14f]/15"
                  >
                    {skill.name}
                    <span className="ml-1.5 text-[#087a38]/70">×</span>
                  </button>
                ))}
            </div>
          ) : null}

          <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/60 p-2">
            {visibleSkills.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-zinc-500">
                {skillSearch.trim()
                  ? "Không tìm thấy kỹ năng phù hợp."
                  : "Chưa có kỹ năng."}
              </p>
            ) : (
              <div className="grid gap-1 sm:grid-cols-2">
                {visibleSkills.map((s) => {
                  const active = skillIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                        active
                          ? "bg-[#00b14f]/10 text-[#087a38]"
                          : "text-zinc-800 hover:bg-white",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleSkill(s.id)}
                      />
                      <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {canCreateSkill ? (
            <button
              type="button"
              disabled={createSkillMut.isPending || companyLocked}
              onClick={() => createSkillMut.mutate(skillSearch.trim())}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#00b14f]/40 bg-[#00b14f]/5 px-3 py-2.5 text-sm font-semibold text-[#087a38] transition hover:bg-[#00b14f]/10 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {createSkillMut.isPending
                ? "Đang tạo…"
                : `Tạo kỹ năng “${skillSearch.trim()}”`}
            </button>
          ) : null}
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
