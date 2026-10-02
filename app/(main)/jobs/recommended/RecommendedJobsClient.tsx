"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import JobSearchResultRows from "@/app/(main)/components/job/JobSearchResultRows";
import { STALE_JOB_RECOMMENDATIONS_MS } from "@/lib/query-stale-time";
import { jobsRecommendedListQueryKey } from "@/lib/recommendation-queries";
import { fetchRecommendedJobs } from "@/services/recommendation.service";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";
import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";
import { useAuthStore } from "@/app/stores/auth.store";

const LIMIT = 12;

export default function RecommendedJobsClient() {
  const [page, setPage] = useState(1);
  const hideCandidateFeatures = useAuthenticatedNonCandidate();
  const loadingAuth = useAuthStore((s) => s.loadingAuth);
  const userId = useAuthStore((s) => s.user?.id);

  const q = useQuery({
    queryKey: jobsRecommendedListQueryKey(userId, page, LIMIT),
    queryFn: () => fetchRecommendedJobs({ page, limit: LIMIT }),
    staleTime: STALE_JOB_RECOMMENDATIONS_MS,
    retry: false,
    enabled: !hideCandidateFeatures && !!userId,
  });

  const onPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const onNext = useCallback(() => {
    const max = q.data?.pagination.totalPages ?? 1;
    setPage((p) => Math.min(max, p + 1));
  }, [q.data?.pagination.totalPages]);

  if (hideCandidateFeatures) {
    return (
      <CandidateOnlyNotice>
        Gợi ý việc làm phù hợp chỉ dành cho tài khoản ứng viên. Với nhà tuyển
        dụng, hãy dùng khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  if (loadingAuth || !userId) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-500">
        Đang tải gợi ý…
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-8 text-center text-sm text-amber-900">
        Bạn cần đăng nhập với tài khoản ứng viên để xem gợi ý phù hợp.
      </div>
    );
  }

  if (q.isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-500">
        Đang tải gợi ý…
      </div>
    );
  }

  const data = q.data;
  if (!data?.jobs.length) {
    return (
      <div className="space-y-4 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-gray-600">
          Chưa có tin phù hợp trong danh sách gợi ý. Hãy cập nhật{" "}
          <Link
            href="/profile/recommendations"
            className="font-semibold text-primary hover:underline"
          >
            sở thích tìm việc
          </Link>{" "}
          hoặc xem toàn bộ{" "}
          <Link
            href="/jobs"
            className="font-semibold text-primary hover:underline"
          >
            việc làm
          </Link>
          .
        </p>
      </div>
    );
  }

  const { pagination } = data;
  const safePage = pagination.page > 0 ? pagination.page : 1;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-gray-500">
          Gợi ý <b>{pagination.total}</b> việc làm phù hợp (theo kỹ năng, khu
          vực, …)
        </p>
      </div>

      <JobSearchResultRows jobs={data.jobs} />

      {pagination.totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-6"
          aria-label="Phân trang việc phù hợp"
        >
          {safePage > 1 ? (
            <button
              type="button"
              onClick={onPrev}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary"
            >
              Trước
            </button>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-zinc-300">
              Trước
            </span>
          )}

          <span className="px-2 text-sm text-zinc-600">
            Trang {safePage} / {pagination.totalPages}
          </span>

          {safePage < pagination.totalPages ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary"
            >
              Sau
            </button>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-zinc-300">
              Sau
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
