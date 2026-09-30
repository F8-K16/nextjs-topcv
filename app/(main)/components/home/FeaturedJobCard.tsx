"use client";

import Image from "next/image";
import Link from "next/link";

import type { Job } from "@/app/types/job.type";
import { formatSalaryShort } from "@/utils/helper";
import SaveJobButton from "../buttons/SaveJobButton";
import AppliedJobBadge from "../badges/AppliedJobBadge";
import { jobPublicPath } from "@/lib/job-path";

export default function FeaturedJobCard({ job }: { job: Job }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link href={jobPublicPath(job)} className="flex flex-1 flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-100">
            <Image
              src={job.company.logo || "/images/logo-default.png"}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-primary">
              {job.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              {job.company.name}
            </p>
          </div>
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-2 border-t border-zinc-50 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
            {formatSalaryShort(job.minSalary, job.maxSalary)}
          </span>
          {job.workLocation ? (
            <span className="max-w-[min(100%,12rem)] truncate rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 sm:max-w-[14rem]">
              {job.workLocation}
            </span>
          ) : (
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
              {job.company.province?.name ?? "—"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AppliedJobBadge jobId={job.id} />
          <SaveJobButton jobId={job.id} />
        </div>
      </div>
    </article>
  );
}
