"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { Job } from "@/app/types/job.type";
import { STALE_FEATURED_JOBS_MS } from "@/lib/query-stale-time";
import { jobService } from "@/services/job.service";
import FeaturedJobCard from "./FeaturedJobCard";

const PAGE_SIZE = 8;

export default function FeaturedJobsSection() {
  const [page, setPage] = useState(1);

  const query = useMemo(() => {
    return new URLSearchParams({
      isFeatured: "true",
      limit: String(PAGE_SIZE),
      page: String(page),
    }).toString();
  }, [page]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["home-featured-jobs", page],
    queryFn: () => jobService.getJobs(query),
    staleTime: STALE_FEATURED_JOBS_MS,
  });

  const jobs: Job[] = data?.jobs ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;

  if (isLoading && !data) {
    return (
      <section className="border-b border-zinc-200/80 bg-linear-to-b from-white to-zinc-50 py-10 md:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 text-sm text-zinc-500">
          Đang tải việc làm nổi bật…
        </div>
      </section>
    );
  }

  if (!jobs.length) return null;

  return (
    <section className="border-b border-zinc-200/80 bg-linear-to-b from-white to-zinc-50 py-10 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="mb-6 space-y-2 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Gợi ý hôm nay
          </p>
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
            <h2 className="min-w-0 flex-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
              Việc làm nổi bật
            </h2>
            <Link
              href="/jobs"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <p className="hidden max-w-xl text-sm text-zinc-600 sm:block">
            Các tin do quản trị viên ghim nổi bật — đã duyệt và còn hạn nộp hồ
            sơ.
          </p>
        </div>

        {isFetching && (
          <p className="mb-4 text-xs text-zinc-500">Đang cập nhật…</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((job) => (
            <FeaturedJobCard key={job.id} job={job} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              title={"Trang trước"}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-primary">
              {page}{" "}
              <span className="font-normal text-zinc-400">/ {totalPages}</span>
            </span>
            <button
              type="button"
              title={"Trang sau"}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
