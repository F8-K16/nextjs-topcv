"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { useModalStore } from "@/app/stores/modal.store";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { useRBAC } from "@/hooks/useRBAC";

type Props = {
  jobId: number;
};

export default function ApplyJobButton({ jobId }: Props) {
  const { isAuthenticated, can } = useRBAC();
  const { openModal } = useModalStore();
  const router = useRouter();
  const { hasApplied } = useAppliedJobs();
  const applied = hasApplied(jobId);

  const handleApply = () => {
    if (!isAuthenticated) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(next)}`);
      return;
    }
    if (applied) return;

    openModal("apply", { jobId });
  };

  // Chỉ ứng viên (và khách chưa đăng nhập) mới thấy nút ứng tuyển
  if (!can("jobs:apply") && isAuthenticated) {
    return null;
  }

  if (applied) {
    return (
      <span
        className="inline-flex h-10 w-full flex-1 cursor-default items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 text-sm font-semibold text-emerald-800"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={18} className="shrink-0" aria-hidden />
        Đã ứng tuyển
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleApply}
      className="inline-flex h-10 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-6 text-sm font-semibold text-white transition hover:bg-[#009944] cursor-pointer"
    >
      <Send size={18} />
      Ứng tuyển ngay
    </button>
  );
}
