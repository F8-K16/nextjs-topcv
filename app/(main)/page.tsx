import type { Metadata } from "next";

import CompanyFilterBar from "./components/home/CompanyFilterBar";
import CompanySection from "./components/home/CompanySection";
import BlogTeaserSection from "./components/home/BlogTeaserSection";
import FeaturedJobsSection from "./components/home/FeaturedJobsSection";
import HomeRecommendedJobsSection from "./components/home/HomeRecommendedJobsSection";
import HomeFilterBar from "./components/home/JobFilterBar";
import HomeJobSearch from "./components/home/HomeJobSearch";
import HomeHero from "./components/home/HomeHero";
import JobSection from "./components/home/JobSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import TopCompaniesSection from "./components/home/TopCompaniesSection";
import WhyChooseUs from "./components/home/WhyChooseUs";

import { getCachedHomeTopCompanies } from "@/lib/home-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "Việc làm mới, gợi ý phù hợp và doanh nghiệp uy tín — TopCV.",
};

export const revalidate = 240;

export default async function HomePage() {
  const companiesPayload = await getCachedHomeTopCompanies();

  return (
    <div className="min-h-0 w-full min-w-0 max-w-[100vw] bg-zinc-50/50">
      <HomeHero />
      <FeaturedJobsSection />
      <HomeRecommendedJobsSection />

      <section className="border-b border-zinc-200/80 bg-[#f3f5f7] py-8 md:py-14">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-3 sm:space-y-8 sm:px-4">
          <div className="mb-6 space-y-2 md:mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Khám phá
            </p>
            <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
              <h2 className="min-w-0 flex-1 text-xl font-bold text-zinc-900 md:text-3xl">
                Việc làm tốt nhất
              </h2>
              <Link
                href="/jobs"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </div>

          <HomeJobSearch />
          <HomeFilterBar />
          <JobSection />
        </div>
      </section>

      <section className="border-b border-zinc-200/80 bg-white py-8 md:py-14">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
          <div className="overflow-hidden rounded-3xl border border-zinc-200/90 text-white shadow-xl">
            <div className="space-y-3 bg-[#785904] p-5 sm:p-8 md:p-10">
              <div className="flex flex-row flex-wrap items-start justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
                <h2 className="min-w-0 flex-1 text-xl font-bold text-[#f2e7ac] md:text-2xl">
                  Thương hiệu lớn tiêu biểu
                </h2>
                <Link
                  href="/companies"
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#f2e7ac] hover:underline"
                >
                  Xem tất cả công ty
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>
              <p className="hidden max-w-xl text-sm text-[#f2e7ac]/90 sm:block">
                Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên TopCV
                Pro
              </p>
            </div>
            <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur md:p-6">
              <CompanyFilterBar />
              <CompanySection />
            </div>
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <TopCompaniesSection companies={companiesPayload.companies} />
      </div>

      <WhyChooseUs />
      <div className="hidden md:block">
        <TestimonialsSection />
      </div>
      <BlogTeaserSection />
    </div>
  );
}
