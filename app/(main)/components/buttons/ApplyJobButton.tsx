"use client";

import { CheckCircle2, Send } from "lucide-react";

import { useAuthStore } from "@/app/stores/auth.store";
import { useModalStore } from "@/app/stores/modal.store";
import { useAppliedJobs } from "@/hooks/use-applied-jobs";
import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";

type Props = {
  jobId: number;
};

export default function ApplyJobButton({ jobId }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useModalStore();
  const { hasApplied } = useAppliedJobs();
  const applied = hasApplied(jobId);
  const hideCandidateFeatures = useAuthenticatedNonCandidate();

  const handleApply = () => {
    if (!isAuthenticated) {
      openModal("login");
      return;
    }
    if (applied) return;

    openModal("apply", { jobId });
  };

  if (hideCandidateFeatures) {
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
