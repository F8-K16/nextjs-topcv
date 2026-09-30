import Link from "next/link";

import { JobsResponse } from "@/app/types/job.type";
import { nextFetchCache } from "@/lib/next-fetch-cache";

import JobSearchResultRows from "./JobSearchResultRows";
import { API_BASE_URL } from "@/lib/api-base-url";

export const JOBS_LIST_PAGE_SIZE = 24;

type Props = {
  search?: string;
  provinceId?: number;
  districtId?: number;
  categoryId?: number;
  categoryIds?: number[];
  salaryRange?: string;
  experienceLevel?: string;
  jobType?: string;
  companyId?: number;
  page?: number;
  limit?: number;
};

function buildJobsQueryString(props: Props, page: number): string {
  const params = new URLSearchParams();
  const limit =
    props.limit && props.limit > 0 ? props.limit : JOBS_LIST_PAGE_SIZE;

  if (props.search) params.set("search", props.search);
  if (props.provinceId) params.set("provinceId", String(props.provinceId));
  if (props.districtId) params.set("districtId", String(props.districtId));
  if (props.categoryIds?.length) {
    const uniq = [...new Set(props.categoryIds)]
      .filter((n) => Number.isFinite(n) && n !== 0)
      .map((n) => Math.trunc(n))
      .sort((a, b) => a - b);
    if (uniq.length) params.set("categoryIds", uniq.join(","));
  } else if (props.categoryId) {
    params.set("categoryId", String(props.categoryId));
  }
  if (props.salaryRange) params.set("salaryRange", String(props.salaryRange));
  if (props.experienceLevel)
    params.set("experienceLevel", String(props.experienceLevel));
  if (props.jobType) params.set("jobType", String(props.jobType));
  if (props.companyId) params.set("companyId", String(props.companyId));

  params.set("page", String(Math.max(1, page)));
  params.set("limit", String(limit));

  return params.toString();
}

async function getJobs(query: Props): Promise<JobsResponse | null> {
  const qs = buildJobsQueryString(
    query,
    query.page && query.page > 0 ? query.page : 1,
  );

  const res = await fetch(`${API_BASE_URL}/jobs?${qs}`, {
    ...nextFetchCache.jobList,
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function JobSearchResult(props: Props) {
  const data = await getJobs(props);

  if (!data || data.jobs.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        Không có kết quả phản hồi
      </div>
    );
  }

  const { page, totalPages } = data.pagination;
  const safePage = page > 0 ? page : 1;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-gray-500">
          Tìm thấy <b>{data.pagination.total}</b> việc làm
        </p>
      </div>

      <JobSearchResultRows jobs={data.jobs} />

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-6"
          aria-label="Phân trang danh sách việc làm"
        >
          {safePage > 1 ? (
            <Link
              href={`/jobs?${buildJobsQueryString(props, safePage - 1)}`}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary"
            >
              Trước
            </Link>
          ) : (
            <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-zinc-300">
              Trước
            </span>
          )}

          <span className="px-2 text-sm text-zinc-600">
            Trang {safePage} / {totalPages}
          </span>

          {safePage < totalPages ? (
            <Link
              href={`/jobs?${buildJobsQueryString(props, safePage + 1)}`}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-primary hover:text-primary"
            >
              Sau
            </Link>
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
