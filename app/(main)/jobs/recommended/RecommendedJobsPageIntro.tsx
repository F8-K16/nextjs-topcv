"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";

export default function RecommendedJobsPageIntro() {
  const hideCandidateFeatures = useAuthenticatedNonCandidate();

  return (
    <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Dành cho bạn
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Việc làm phù hợp
          </h1>
          {hideCandidateFeatures ? (
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Gợi ý cá nhân chỉ dành cho tài khoản ứng viên. Với nhà tuyển dụng,
              hãy dùng khu vực quản lý tin và hồ sơ ứng tuyển.
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Ưu tiên tin khớp kỹ năng, ngành và khu vực bạn đã cài trong{" "}
              <Link
                href="/profile/recommendations"
                className="font-semibold text-primary hover:underline"
              >
                sở thích tìm việc
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
