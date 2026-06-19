"use client";

import { CheckCircle2 } from "lucide-react";

import { useAppliedJobs } from "@/hooks/use-applied-jobs";

type Props = {
  jobId: number;
  className?: string;
};

export default function AppliedJobBadge({ jobId, className = "" }: Props) {
  const { hasApplied } = useAppliedJobs();
  if (!hasApplied(jobId)) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80 ${className}`}
    >
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Đã ứng tuyển
    </span>
  );
}
