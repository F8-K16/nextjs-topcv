"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart, Briefcase } from "lucide-react";

import type { Job } from "@/app/types/job.type";
import {
  formatExperience,
  formatJobType,
  formatSalaryShort,
} from "@/utils/helper";
import AppliedJobBadge from "@/app/(main)/components/badges/AppliedJobBadge";

export default function JobSearchResultRows({ jobs }: { jobs: Job[] }) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex gap-3 rounded-xl border border-[#57d991] bg-[#f2faf6] p-3 transition hover:shadow-md sm:gap-4 sm:p-4"
        >
          <Link
            href={`/jobs/${job.id}`}
            className="flex min-w-0 flex-1 gap-3 sm:gap-4"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-20 sm:w-20 md:h-24 md:w-24">
              <Image
                src={job.company.logo || "/images/logo-default.png"}
                alt={job.company.name}
                fill
                sizes="(max-width: 640px) 56px, (max-width: 768px) 80px, 96px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#263a4d] hover:text-primary sm:text-[15px]">
                {job.title}
              </h3>

              <p className="mt-1 text-xs font-semibold text-[#e39314] sm:text-[13px]">
                {job.company.name}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                <Tag icon={<MapPin size={12} />}>
                  {job.company.province.name}
                </Tag>

                {job.jobType && (
                  <Tag icon={<Briefcase size={12} />}>
                    {formatJobType(job.jobType)}
                  </Tag>
                )}

                {job.experienceLevel && (
                  <Tag>{formatExperience(job.experienceLevel)}</Tag>
                )}
                {job.category?.name && <Tag>{job.category.name}</Tag>}
                <AppliedJobBadge jobId={job.id} />
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 flex-col items-end justify-between gap-1">
            <span className="text-xs font-semibold text-primary sm:text-sm">
              {formatSalaryShort(job.minSalary, job.maxSalary)}
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500 text-green-500 hover:bg-green-50 sm:h-9 sm:w-9"
              aria-label="Lưu việc"
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <span className="text-[10px] text-gray-400 sm:text-xs">
              {job.quantity} vị trí
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tag({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] text-[#333333] sm:px-3 sm:py-1 sm:text-xs">
      {icon}
      {children}
    </span>
  );
}
