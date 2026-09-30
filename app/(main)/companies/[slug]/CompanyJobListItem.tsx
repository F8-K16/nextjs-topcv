"use client";

import Link from "next/link";
import { Briefcase, Clock } from "lucide-react";

import type { Job } from "@/app/types/job.type";
import {
  formatDate,
  formatExperience,
  formatJobType,
  formatSalaryShort,
} from "@/utils/helper";
import AppliedJobBadge from "@/app/(main)/components/badges/AppliedJobBadge";
import { jobPublicPath } from "@/lib/job-path";

function Tag({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "accent" | "muted";
}) {
  const cls =
    variant === "accent"
      ? "bg-[#00b14f]/12 text-[#00b14f] ring-[#00b14f]/20"
      : variant === "muted"
        ? "bg-zinc-100 text-zinc-600 ring-zinc-200/80"
        : "bg-sky-50 text-sky-800 ring-sky-200/60";
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-lg px-2 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}

export default function CompanyJobListItem({ job }: { job: Job }) {
  const skillCount = job.jobSkills?.length ?? 0;
  const deadlineLabel = job.deadline ? `Hạn ${formatDate(job.deadline)}` : null;

  return (
    <li>
      <Link
        href={jobPublicPath(job)}
        className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-[#00b14f]/40 hover:shadow-md sm:flex-row sm:items-stretch sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 hover:text-[#00b14f]">
            {job.title}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag variant="accent">{job.category.name}</Tag>

            {job.jobSkills?.slice(0, 4).map((js) => (
              <Tag key={js.skill.id}>{js.skill.name}</Tag>
            ))}
            {skillCount > 5 ? (
              <Tag variant="muted">+{skillCount - 4} kỹ năng</Tag>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Tag variant="muted">{formatExperience(job.experienceLevel)}</Tag>
            {deadlineLabel ? (
              <Tag variant="muted">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" aria-hidden />
                  {deadlineLabel}
                </span>
              </Tag>
            ) : null}
            <Tag variant="muted">{formatJobType(job.jobType)}</Tag>
          </div>
        </div>
        <div className="shrink-0 text-right sm:pt-0.5 flex flex-col self-stretch">
          <p className="text-sm font-bold text-[#00b14f]">
            {formatSalaryShort(job.minSalary, job.maxSalary)}
          </p>

          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-400">
            <Briefcase className="h-3.5 w-3.5" />
            Chi tiết
          </p>

          <div className="mt-auto">
            <AppliedJobBadge jobId={job.id} />
          </div>
        </div>
      </Link>
    </li>
  );
}
