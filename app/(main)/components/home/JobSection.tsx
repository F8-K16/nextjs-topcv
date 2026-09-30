"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useJobFilterStore } from "@/app/stores/job.store";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatSalaryShort } from "@/utils/helper";
import { jobService } from "@/services/job.service";

import { Job } from "@/app/types/job.type";
import { Skeleton } from "@/components/ui/skeleton";
import SaveJobButton from "../buttons/SaveJobButton";
import AppliedJobBadge from "../badges/AppliedJobBadge";
import { STALE_PUBLIC_JOB_LIST_MS } from "@/lib/query-stale-time";
import { jobFiltersToStableQuery } from "@/lib/stable-query-key";
import { jobPublicPath } from "@/lib/job-path";

export default function JobSection() {
  const { filters, setFilter } = useJobFilterStore();

  const query = useMemo(() => jobFiltersToStableQuery(filters), [filters]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["jobs", query],
    queryFn: () => jobService.getJobs(query),
    placeholderData: (prev) => prev,
    staleTime: STALE_PUBLIC_JOB_LIST_MS,
  });

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-6 text-center text-sm text-red-800">
        <p className="font-medium">Không tải được danh sách việc làm.</p>
        <p className="mt-2 text-xs opacity-90">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <p className="mt-3 text-xs text-red-700/80">Kiểm tra kết nối mạng.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex gap-3">
              <Skeleton className="h-16 w-16 shrink-0 rounded-sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.jobs.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        Không có việc làm phù hợp.
      </div>
    );
  }

  const currentPage = filters.page;
  const totalPages = data.pagination.totalPages;

  return (
    <div className="space-y-6">
      {isFetching && (
        <div className="text-sm text-gray-500">Đang cập nhật dữ liệu...</div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.jobs.map((job: Job) => {
          return (
            <div
              key={job.id}
              className="rounded-xl border border-white bg-white p-3 hover:border-[#00b14f]"
            >
              <Link href={jobPublicPath(job)}>
                <div className="flex gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-sm bg-gray-50">
                    <Image
                      src={job.company.logo || "/images/logo-default.png"}
                      alt={job.company.name}
                      width={63}
                      height={63}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-[#00b14f]">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.company.name}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="mt-3 flex flex-col gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#edeff0] px-3 py-1 text-xs">
                    {formatSalaryShort(job.minSalary, job.maxSalary)}
                  </span>
                  <span className="max-w-[min(100%,14rem)] truncate rounded-full bg-[#edeff0] px-3 py-1 text-xs">
                    {job.company.province?.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <AppliedJobBadge jobId={job.id} />
                  <SaveJobButton jobId={job.id} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setFilter("page", currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 rounded-full border border-[#00b14f] text-[#00b14f] flex items-center justify-center hover:bg-[#00b14f] hover:text-white transition cursor-pointer"
          >
            <ChevronLeft />
          </button>

          <span className="text-sm text-[#00b14f] font-semibold">
            {currentPage} /{" "}
            <span className="text-[#a6acb2]">{totalPages} trang</span>
          </span>

          <button
            onClick={() => setFilter("page", currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 rounded-full border border-[#00b14f] text-[#00b14f] flex items-center justify-center hover:bg-[#00b14f] hover:text-white transition cursor-pointer"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
