import { Suspense } from "react";
import type { Metadata } from "next";

import JobFilterSidebar from "../components/job/JobFilterSidebar";
import JobSearchResult, {
  JOBS_LIST_PAGE_SIZE,
} from "../components/job/JobSearchResult";
import JobsSearchBar from "../components/job/JobsSearchBar";

type Props = {
  searchParams: Promise<{
    search?: string;
    provinceId?: string;
    districtId?: string;
    categoryId?: string;
    categoryIds?: string;
    salaryRange?: string;
    experienceLevel?: string;
    jobType?: string;
    companyId?: string;
    page?: string;
    limit?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Việc làm",
  description:
    "Danh sách việc làm — lọc theo địa điểm, lương, ngành nghề và hình thức làm việc.",
};

export default async function JobPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categoryIds = sp.categoryIds
    ? sp.categoryIds
        .split(",")
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n !== 0)
        .map((n) => Math.trunc(n))
    : [];

  return (
    <main className="min-h-[60vh] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_45%,#f4f4f5_100%)]">
      <div className="mx-auto max-w-6xl px-3 py-7 sm:px-4 sm:py-8 md:py-10">
        <header className="mb-5 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Việc làm
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-zinc-900 sm:tracking-tight md:text-3xl">
            Danh sách việc làm
          </h1>
          <p className="mt-2 hidden max-w-2xl text-sm text-zinc-600 sm:block">
            Tìm theo từ khóa, lọc theo ngành nghề và địa điểm — cập nhật liên
            tục.
          </p>
        </header>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-6 lg:gap-8">
          <Suspense
            fallback={
              <aside className="h-48 w-full shrink-0 animate-pulse rounded-2xl bg-zinc-100/80 md:w-[260px] lg:w-[280px]" />
            }
          >
            <JobFilterSidebar />
          </Suspense>

          <div className="min-w-0 flex-1">
            <Suspense>
              <div className="sticky top-20 z-10 mb-6 rounded-2xl bg-white/80 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-zinc-200/70 backdrop-blur">
                <JobsSearchBar initialSearch={sp.search ?? ""} />
              </div>
            </Suspense>
            <JobSearchResult
              search={sp.search}
              provinceId={sp.provinceId ? Number(sp.provinceId) : undefined}
              districtId={sp.districtId ? Number(sp.districtId) : undefined}
              categoryId={sp.categoryId ? Number(sp.categoryId) : undefined}
              categoryIds={categoryIds.length ? categoryIds : undefined}
              salaryRange={sp.salaryRange}
              experienceLevel={sp.experienceLevel}
              jobType={sp.jobType}
              companyId={sp.companyId ? Number(sp.companyId) : undefined}
              page={sp.page ? Number(sp.page) : undefined}
              limit={
                sp.limit ? Number(sp.limit) || JOBS_LIST_PAGE_SIZE : undefined
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
