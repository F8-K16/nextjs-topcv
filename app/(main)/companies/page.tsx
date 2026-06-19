import { Suspense } from "react";
import type { Metadata } from "next";

import CompanySearchResult, {
  COMPANIES_LIST_PAGE_SIZE,
} from "../components/company/CompanySearchResult";
import CompaniesSearchBar from "../components/company/CompaniesSearchBar";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    limit?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Công ty",
  description: "Khám phá nhà tuyển dụng và cơ hội việc làm tại các doanh nghiệp.",
};

export default async function CompaniesPage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <main className="min-h-[60vh] bg-white">
      <section className="bg-emerald-50">
        <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4 md:py-12">
          <div className="grid items-center gap-6 md:gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="text-2xl font-extrabold tracking-normal text-emerald-800 sm:tracking-tight md:text-3xl">
                Khám phá các công ty nổi bật
              </h1>
              <p className="mt-2 hidden text-sm text-emerald-900/70 sm:block">
                Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành
                cho bạn
              </p>
              <div className="mt-4 sm:mt-6">
                <Suspense>
                  <CompaniesSearchBar initialSearch={sp.search ?? ""} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 py-8 sm:px-4 md:py-12">
        <h2 className="text-center text-sm font-extrabold tracking-wide text-zinc-900 sm:text-base md:text-lg">
          DANH SÁCH CÁC CÔNG TY NỔI BẬT
        </h2>
        <div className="mt-6 md:mt-8">
          <CompanySearchResult
            search={sp.search}
            page={sp.page ? Number(sp.page) : undefined}
            limit={
              sp.limit
                ? Number(sp.limit) || COMPANIES_LIST_PAGE_SIZE
                : undefined
            }
          />
        </div>
      </section>
    </main>
  );
}
