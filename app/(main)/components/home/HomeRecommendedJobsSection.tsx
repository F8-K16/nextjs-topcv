"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";

import FeaturedJobCard from "./FeaturedJobCard";
import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_JOB_RECOMMENDATIONS_MS } from "@/lib/query-stale-time";
import { jobsRecommendedListQueryKey } from "@/lib/recommendation-queries";
import { fetchRecommendedJobs } from "@/services/recommendation.service";

const LIMIT = 8;

function RecommendedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          className="h-45 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-100/80"
        />
      ))}
    </div>
  );
}

export default function HomeRecommendedJobsSection() {
  const user = useAuthStore((s) => s.user);
  const loadingAuth = useAuthStore((s) => s.loadingAuth);

  const enabled = !loadingAuth && Boolean(user?.roles?.includes("CANDIDATE"));

  const q = useQuery({
    queryKey: jobsRecommendedListQueryKey(user?.id, 1, LIMIT),
    queryFn: () => fetchRecommendedJobs({ page: 1, limit: LIMIT }),
    staleTime: STALE_JOB_RECOMMENDATIONS_MS,
    enabled,
    retry: false,
  });

  if (!enabled) return null;

  if (q.isLoading) {
    return (
      <section className="border-b border-zinc-200/80 bg-linear-to-b from-white to-zinc-50 py-10 md:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="mb-10 h-24 max-w-lg animate-pulse rounded-xl bg-zinc-100" />
          <RecommendedSkeleton />
        </div>
      </section>
    );
  }

  if (q.isError || !q.data?.jobs?.length) {
    return (
      <section className="border-b border-zinc-200/80 bg-linear-to-b from-white to-zinc-50 py-10 md:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Dành cho bạn
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                Việc làm phù hợp với bạn
              </h2>
              <p className="mt-2 hidden max-w-xl text-sm text-zinc-600 sm:block">
                Cập nhật sở thích và công việc mong muốn để nhận gợi ý cá nhân
                hóa.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-zinc-200 bg-white/90 p-5 text-center shadow-sm sm:p-8 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-zinc-900">
                  Chưa có tin phù hợp hoặc cần thiết lập sở thích
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Thêm kỹ năng, khu vực và mức lương mong muốn để gợi ý chính
                  xác hơn.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              <Link
                href="/profile/recommendations"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
              >
                Thiết lập sở thích
              </Link>
              <Link
                href="/jobs/recommended"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-primary hover:text-primary"
              >
                Xem trang gợi ý
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const jobs = q.data.jobs;

  return (
    <section className="border-b border-zinc-200/80 bg-linear-to-b from-white to-zinc-50 py-10 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div>
          <div className="mb-6 space-y-2 md:mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Dành cho bạn
            </p>
            <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
              <h2 className="min-w-0 flex-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                Việc làm phù hợp với bạn
              </h2>
              <Link
                href="/jobs/recommended"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
            <p className="hidden max-w-xl text-sm text-zinc-600 sm:block">
              Gợi ý theo kỹ năng, ngành nghề và khu vực sinh sống của bạn.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((job) => (
            <FeaturedJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
