"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_SAVED_JOBS_MS } from "@/lib/query-stale-time";
import { savedJobService } from "@/services/saved-job.service";

import {
  Loader2,
  Trash2,
  MapPin,
  Briefcase,
  Clock3,
  CalendarDays,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { jobPublicPath } from "@/lib/job-path";

import {
  formatExperience,
  formatJobType,
  formatSalaryShort,
  formatDate,
} from "@/utils/helper";

import { SavedJobWithJob } from "@/app/types/job.type";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";

export default function SavedJobList() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const savedJobsKey = ["saved-jobs", user?.id];

  const {
    data = [],
    isLoading,
    isFetching,
  } = useQuery<SavedJobWithJob[]>({
    queryKey: savedJobsKey,
    queryFn: savedJobService.getSavedJobs,
    enabled: !!user?.id && isCandidate,
    staleTime: STALE_SAVED_JOBS_MS,
  });

  const unsaveMutation = useMutation({
    mutationFn: savedJobService.unsaveJob,
    onMutate: async (jobId: number) => {
      setLoadingId(jobId);

      await queryClient.cancelQueries({
        queryKey: savedJobsKey,
      });

      const previous =
        queryClient.getQueryData<SavedJobWithJob[]>(savedJobsKey) || [];

      queryClient.setQueryData<SavedJobWithJob[]>(savedJobsKey, (old = []) =>
        old.filter((item) => item.jobId !== jobId),
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(savedJobsKey, context?.previous || []);
    },
    onSettled: () => {
      setLoadingId(null);

      queryClient.invalidateQueries({
        queryKey: savedJobsKey,
      });
    },
  });

  if (user?.id && !isCandidate) {
    return (
      <CandidateOnlyNotice>
        Lưu việc làm chỉ dành cho tài khoản ứng viên. Với nhà tuyển dụng, hãy
        dùng khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-16 text-center text-gray-500 text-sm">
        Bạn chưa lưu việc làm nào. Khám phá tin tuyển dụng và nhấn lưu để xem
        lại tại đây.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFetching && (
        <p className="text-sm text-gray-400">Đang cập nhật dữ liệu...</p>
      )}

      <p className="text-sm text-gray-600">
        Bạn đã lưu{" "}
        <span className="font-semibold text-[#00b14f]">{data.length}</span> việc
        làm
      </p>

      <div className="space-y-4">
        {data.map((item) => {
          const job = item.job;
          const isMutating = loadingId === job.id;

          return (
            <div
              key={item.jobId}
              className="flex gap-4 rounded-2xl border border-gray-100 bg-linear-to-br from-white to-[#f6fbf8] p-4 md:p-5 transition hover:border-[#00b14f]/30 hover:shadow-md"
            >
              <Link href={jobPublicPath(job)}>
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={job.company.logo || "/images/logo-default.png"}
                    alt={job.company.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-fill"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={jobPublicPath(job)}>
                  <h3 className="line-clamp-1 text-[15px] font-semibold text-[#263a4d] hover:text-[#00b14f]">
                    {job.title}
                  </h3>
                </Link>

                <p className="mt-1 text-[13px] font-semibold text-[#e39314]">
                  {job.company.name}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Tag icon={<MapPin size={12} />}>
                    {job.company.province?.name}
                  </Tag>

                  <Tag icon={<Briefcase size={12} />}>
                    {formatJobType(job.jobType)}
                  </Tag>

                  <Tag icon={<Clock3 size={12} />}>
                    {formatExperience(job.experienceLevel)}
                  </Tag>

                  <Tag>{job.category.name}</Tag>
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays size={13} />
                  Đã lưu ngày {formatDate(item.createdAt)}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <span className="text-sm font-semibold text-[#00b14f]">
                  {formatSalaryShort(job.minSalary, job.maxSalary)}
                </span>

                <button
                  onClick={() => unsaveMutation.mutate(job.id)}
                  disabled={isMutating}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500 text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                  {isMutating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>

                <span className="text-xs text-gray-400">
                  {job.quantity} vị trí
                </span>
              </div>
            </div>
          );
        })}
      </div>
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
    <span className="flex items-center gap-1 rounded-full bg-[#f0f0f0] px-3 py-1 text-xs text-[#333333]">
      {icon}
      {children}
    </span>
  );
}
