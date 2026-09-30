import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { MapPin, Globe, Building2, ExternalLink } from "lucide-react";
import type { Company } from "@/app/types/company.type";
import type { Job } from "@/app/types/job.type";
import { formatGeographyLine } from "@/utils/helper";
import { nextFetchCache } from "@/lib/next-fetch-cache";

import CompanyJobListItem from "./CompanyJobListItem";
import CompanyFollowButton from "./CompanyFollowButton";
import CompanyMapSection from "./CompanyMapSection";
import { BreadcrumbDetailLabel } from "@/contexts/BreadcrumbDetailContext";
import { API_BASE_URL } from "@/lib/api-base-url";

type CompanyPublic = Company & {
  jobs: Job[];
};

async function getCompany(key: string): Promise<CompanyPublic | null> {
  const base = API_BASE_URL;
  const slug = key.trim();
  if (!base || !slug) return null;
  const res = await fetch(`${base}/companies/${encodeURIComponent(slug)}`, {
    ...nextFetchCache.companyDetail,
  });
  if (res.status === 404 || !res.ok) return null;
  return res.json() as Promise<CompanyPublic>;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return { title: "Công ty" };
  return { title: company.name };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company) notFound();

  if (company.slug && company.slug !== slug) {
    redirect(`/companies/${company.slug}`);
  }

  const website = company.website?.trim();

  return (
    <div className="min-h-screen bg-[#f3f5f7] pb-12 pt-4 md:pt-5">
      <BreadcrumbDetailLabel>{company.name}</BreadcrumbDetailLabel>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-linear-to-r from-zinc-900 to-[#00b14f]/90 px-6 py-8 text-white md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white">
                <Image
                  src={company.logo || "/images/logo-default.png"}
                  alt=""
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5" />
                  Doanh nghiệp đã xác minh
                </div>
                <h1 className="mt-3 text-2xl font-bold md:text-3xl">
                  {company.name}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {formatGeographyLine(
                    company.location,
                    company.district?.name,
                    company.province?.name,
                  )}
                </p>
                {website ? (
                  <a
                    href={
                      website.startsWith("http")
                        ? website
                        : `https://${website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Truy cập website
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                ) : null}
              </div>
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <div className="flex gap-6 rounded-xl bg-white/10 px-5 py-4 text-center md:text-left">
                  <div>
                    <p className="text-2xl font-bold">{company.jobs.length}</p>
                    <p className="text-xs text-white/80">Tin đang mở</p>
                  </div>
                </div>
                <CompanyFollowButton
                  companyId={company.id}
                  companyName={company.name}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-3 md:p-10">
            <div className="md:col-span-1">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                Giới thiệu
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {company.description?.trim() ||
                  "Doanh nghiệp đang cập nhật giới thiệu."}
              </p>
              {company.categories?.length ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Lĩnh vực
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {company.categories.map((c) => (
                      <span
                        key={c.category.id}
                        className="rounded-full bg-[#00b14f]/10 px-3 py-1 text-xs font-medium text-[#00b14f]"
                      >
                        {c.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <CompanyMapSection
                companyName={company.name}
                location={company.location}
                district={company.district?.name}
                province={company.province?.name}
              />
            </div>

            <div className="md:col-span-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Việc làm đang tuyển
                </h2>
              </div>
              {company.jobs.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-sm text-gray-500">
                  Hiện chưa có tin tuyển dụng công khai.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {company.jobs.map((job) => (
                    <CompanyJobListItem key={job.id} job={job} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
