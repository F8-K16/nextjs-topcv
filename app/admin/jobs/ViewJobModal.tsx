"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Job } from "@/app/types/job.type";
import { invalidatePublicJobListQueries } from "@/lib/public-job-queries";
import { getErrorToastMessage } from "@/lib/submit-error";
import { jobService } from "@/services/job.service";
import { formatCurrency } from "@/utils/helper";

const labelOf = (value: string, options: Array<{ value: string; label: string }>) => {
  return options.find((o) => o.value === value)?.label ?? value;
};

const JOB_TYPE_LABELS = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "FREELANCE", label: "Freelance" },
];

const EXPERIENCE_LABELS = [
  { value: "INTERN", label: "Thực tập" },
  { value: "FRESHER", label: "Không yêu cầu" },
  { value: "JUNIOR", label: "1-2 năm" },
  { value: "MIDDLE", label: "3-5 năm" },
  { value: "SENIOR", label: "5-10 năm" },
  { value: "LEAD", label: "Trưởng nhóm" },
];

export default function ViewJobModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [approving, setApproving] = useState(false);

  const salaryText = (() => {
    const min = job.minSalary ?? null;
    const max = job.maxSalary ?? null;
    if (min == null && max == null) return "Thỏa thuận";
    if (min != null && max != null) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min != null) return `Từ ${formatCurrency(min)}`;
    return `Đến ${formatCurrency(max!)}`;
  })();

  const province = job.company?.province?.name ?? "—";
  const district = job.company?.district?.name ?? "";
  const locationText = district ? `${district}, ${province}` : province;

  const skills = (job.jobSkills ?? [])
    .map((x) => x.skill?.name)
    .filter((s): s is string => typeof s === "string" && s.trim() !== "");

  const approve = async () => {
    try {
      setApproving(true);
      await jobService.patchJobModeration(job.id, "APPROVED");
      await invalidatePublicJobListQueries(queryClient);
      toast.success("Đã duyệt tin");
      onClose();
      router.refresh();
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Không duyệt được tin");
    } finally {
      setApproving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#1e1e1e] text-white border border-gray-700 min-w-3xl max-h-[min(92vh,900px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Xem việc làm chờ duyệt
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3 space-y-5">
          <div>
            <div className="text-sm text-zinc-400">Tiêu đề</div>
            <div className="mt-1 text-lg font-semibold">{job.title}</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Công ty</div>
              <div className="mt-1 font-medium">{job.company?.name ?? "—"}</div>
              <div className="mt-1 text-sm text-zinc-400">{locationText}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Danh mục</div>
              <div className="mt-1 font-medium">{job.category?.name ?? "—"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Hình thức</div>
              <div className="mt-1 font-medium">
                {labelOf(job.jobType, JOB_TYPE_LABELS)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Kinh nghiệm</div>
              <div className="mt-1 font-medium">
                {labelOf(job.experienceLevel, EXPERIENCE_LABELS)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Số lượng</div>
              <div className="mt-1 font-medium">{job.quantity}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Mức lương</div>
              <div className="mt-1 font-medium">{salaryText}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-zinc-400">Hạn nộp</div>
              <div className="mt-1 font-medium">
                {job.deadline ? new Date(job.deadline).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-zinc-400">Địa điểm làm việc (mô tả)</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
              {job.workLocation?.trim() ? job.workLocation : "—"}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-zinc-400">Kỹ năng</div>
            {skills.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-zinc-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-1 text-sm text-zinc-300">—</div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-zinc-400">Mô tả</div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
              {job.description}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-white/10"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={approving}
              onClick={approve}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Duyệt tin
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
