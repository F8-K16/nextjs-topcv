import Image from "next/image";
import Link from "next/link";

import type { CompanyResponse } from "@/app/types/company.type";
import { nextFetchCache } from "@/lib/next-fetch-cache";
import { API_BASE_URL } from "@/lib/api-base-url";
import { companyPublicPath } from "@/lib/company-path";

export const COMPANIES_LIST_PAGE_SIZE = 12;

type Props = {
  search?: string;
  page?: number;
  limit?: number;
};

function buildCompaniesQueryString(props: Props, page: number): string {
  const params = new URLSearchParams();
  const limit =
    props.limit && props.limit > 0 ? props.limit : COMPANIES_LIST_PAGE_SIZE;

  if (props.search) params.set("search", props.search);
  params.set("page", String(Math.max(1, page)));
  params.set("limit", String(limit));

  return params.toString();
}

async function getCompanies(query: Props): Promise<CompanyResponse | null> {
  const base = API_BASE_URL;
  if (!base) return null;

  const qs = buildCompaniesQueryString(
    query,
    query.page && query.page > 0 ? query.page : 1,
  );

  const res = await fetch(`${base}/companies?${qs}`, {
    ...nextFetchCache.companyList,
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function CompanySearchResult(props: Props) {
  const data = await getCompanies(props);

  if (!data || !data.companies.length) {
    return (
      <div className="py-10 text-center text-zinc-500">
        Không tìm thấy công ty phù hợp.
      </div>
    );
  }

  const { page, totalPages } = data.pagination;
  const safePage = page > 0 ? page : 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.companies.map((c) => (
          <Link
            key={c.id}
            href={companyPublicPath(c)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
          >
            <div className="relative aspect-video w-full bg-zinc-50">
              <Image
                src={c.logo || "/images/logo-default.png"}
                alt={c.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            </div>

            <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
              <h2 className="line-clamp-2 text-sm font-extrabold uppercase tracking-wide text-zinc-900 group-hover:text-primary">
                {c.name}
              </h2>
              {c.description?.trim() ? (
                <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-zinc-600">
                  “{c.description.trim()}”
                </p>
              ) : (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">
                  {c.categories
                    ?.map((x) => x.category.name)
                    .filter(Boolean)
                    .join(" · ") || "Cập nhật thông tin công ty"}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-200 pt-6"
          aria-label="Phân trang danh sách công ty"
        >
          {safePage > 1 ? (
            <Link
              href={`/companies?${buildCompaniesQueryString(props, safePage - 1)}`}
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
              href={`/companies?${buildCompaniesQueryString(props, safePage + 1)}`}
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
