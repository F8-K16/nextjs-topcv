import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  MapPin,
  CircleDollarSign,
  Hourglass,
  Briefcase,
  Users,
  Tag,
  Building2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  formatExperience,
  formatJobType,
  formatSalaryShort,
  formatDate,
  formatGeographyLine,
} from "@/utils/helper";
import SaveJobButton from "../../components/buttons/SaveJobButton";
import ApplyJobButton from "../../components/buttons/ApplyJobButton";
import JobContactEmployerCta from "./JobContactEmployerCta";
import JobAiQuestions from "./JobAiQuestions";
import type { Job } from "@/app/types/job.type";
import { nextFetchCache } from "@/lib/next-fetch-cache";
import { companyPublicPath } from "@/lib/company-path";
import {
  parseJobDescription,
  type ParsedJobDescription,
} from "@/lib/job-description";
import { BreadcrumbDetailLabel } from "@/contexts/BreadcrumbDetailContext";
import { API_BASE_URL } from "@/lib/api-base-url";
import { fetchPublicFeatures } from "@/lib/public-features";
import { buildJobPostingJsonLd, jsonLdScript } from "@/lib/job-posting";
import { jobPublicPath } from "@/lib/job-path";
import JobViewSourceTracker from "./JobViewSourceTracker";

async function getJob(key: string): Promise<Job | null> {
  const base = API_BASE_URL;
  const slug = key.trim();
  if (!base || !slug) return null;
  const res = await fetch(`${base}/jobs/${encodeURIComponent(slug)}`, {
    ...nextFetchCache.jobDetail,
  });
  if (res.status === 404 || !res.ok) return null;
  return res.json() as Promise<Job>;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Việc làm" };
  const companyName = job.company?.name?.trim() || "Doanh nghiệp";
  const title = `${job.title} · ${companyName}`;
  const description = `${job.title} tại ${companyName}. Ứng tuyển ngay trên TopCV.`;
  const path = jobPublicPath(job);
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3001";
  return {
    title,
    description,
    alternates: { canonical: `${site}${path}` },
    openGraph: {
      title,
      description,
      url: `${site}${path}`,
      type: "website",
      images: job.company?.logo ? [{ url: job.company.logo }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const [job, features] = await Promise.all([
    getJob(slug),
    fetchPublicFeatures(API_BASE_URL),
  ]);

  if (!job) notFound();

  if (job.slug && job.slug !== slug) {
    redirect(`/jobs/${job.slug}`);
  }

  const deadlineLabel = job.deadline
    ? formatDate(job.deadline)
    : "Không giới hạn";

  const website = job.company.website?.trim();
  const descriptionParsed = parseJobDescription(job.description);

  const workplaceLocationDisplay =
    job.workLocation?.trim() ||
    formatGeographyLine(
      job.company.location,
      job.company.district?.name,
      job.company.province?.name,
    ) ||
    "—";
  const experienceTypeLabel = formatExperienceType(job.experienceLevel);

  const jobPosting = buildJobPostingJsonLd({
    id: job.id,
    slug: job.slug,
    title: job.title,
    description: job.description,
    createdAt: job.createdAt,
    deadline: job.deadline,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    workLocation: workplaceLocationDisplay === "—" ? null : workplaceLocationDisplay,
    company: job.company,
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(
          /\/$/,
          "",
        ),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Việc làm",
        item: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/$/, "")}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title,
        item: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/$/, "")}${jobPublicPath(job)}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7] pb-12 pt-4 md:pt-5">
      <Suspense fallback={null}>
        <JobViewSourceTracker jobId={job.id} />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jobPosting) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
      <BreadcrumbDetailLabel>{job.title}</BreadcrumbDetailLabel>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-linear-to-r from-[#00b14f]/8 to-transparent px-6 py-5 md:px-8">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">
                      {job.title}
                    </h1>
                    <Link
                      href={companyPublicPath(job.company)}
                      className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#00b14f] hover:underline"
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      {job.company.name}
                    </Link>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {job.category.name}
                      </span>
                      {job.isFeatured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          <Sparkles className="h-3.5 w-3.5" />
                          Nổi bật
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                  <InfoTile
                    icon={<CircleDollarSign className="h-5 w-5" />}
                    label="Mức lương"
                    value={formatSalaryShort(job.minSalary, job.maxSalary)}
                  />
                  <InfoTile
                    icon={<MapPin className="h-5 w-5" />}
                    label="Khu vực"
                    value={
                      formatGeographyLine(job.company.province?.name) || "—"
                    }
                  />
                  <InfoTile
                    icon={<Hourglass className="h-5 w-5" />}
                    label="Kinh nghiệm"
                    value={formatExperience(job.experienceLevel)}
                  />
                </div>

                <div className="mt-6 flex w-full items-center gap-3">
                  <ApplyJobButton jobId={job.id} />
                  <SaveJobButton jobId={job.id} size={18} />
                </div>
              </div>

              <div className="grid gap-4 border-b border-gray-50 px-6 py-5 sm:grid-cols-3 md:px-8">
                <MetaRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Hình thức"
                  value={formatJobType(job.jobType)}
                />
                <MetaRow
                  icon={<Users className="h-4 w-4" />}
                  label="Số lượng tuyển"
                  value={String(job.quantity)}
                />
                <MetaRow
                  icon={<Tag className="h-4 w-4" />}
                  label="Mã tin"
                  value={`#${job.id}`}
                />
              </div>
            </div>

            <Section
              title={
                descriptionParsed.kind === "v1"
                  ? "Chi tiết tin tuyển dụng"
                  : "Mô tả công việc"
              }
            >
              <JobDescriptionBody parsed={descriptionParsed} />
            </Section>

            {job.jobSkills && job.jobSkills.length > 0 ? (
              <Section title="Kỹ năng yêu cầu">
                <div className="flex flex-wrap gap-2">
                  {job.jobSkills.map(({ skill }) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-[#00b14f]/25 bg-[#00b14f]/5 px-3 py-1.5 text-sm font-medium text-gray-800"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </Section>
            ) : null}

            {descriptionParsed.kind === "plain" ? (
              <Section title="Quyền lợi & văn hóa">
                <p className="text-sm leading-relaxed text-gray-600">
                  Thông tin phúc lợi, văn hóa doanh nghiệp thường được mô tả
                  trong phần mô tả công việc hoặc trao đổi trực tiếp khi phỏng
                  vấn.
                </p>
              </Section>
            ) : null}

            {features.ai ? (
              <JobAiQuestions
                jobTitle={job.title}
                companyName={job.company?.name}
                jobDescription={job.description}
                skills={(job.jobSkills ?? []).map(({ skill }) => skill.name)}
              />
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400">
                Nhà tuyển dụng
              </h3>
              <div className="mt-4 flex gap-4">
                <Image
                  src={job.company.logo || "/images/logo-default.png"}
                  alt={job.company.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl border border-gray-100 object-contain"
                />
                <div className="min-w-0">
                  <Link
                    href={companyPublicPath(job.company)}
                    className="font-semibold text-gray-900 hover:text-[#00b14f]"
                  >
                    {job.company.name}
                  </Link>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
                {job.company.description?.trim() ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Giới thiệu
                    </p>
                    <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-gray-700">
                      {job.company.description.trim()}
                    </p>
                  </div>
                ) : null}

                <div className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00b14f]" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">
                      Địa điểm
                    </p>
                    <p className="mt-0.5 text-sm text-gray-800">
                      {formatGeographyLine(
                        job.company.location,
                        job.company.district?.name,
                        job.company.province?.name,
                      ) || "—"}
                    </p>
                  </div>
                </div>

                {job.company.categories && job.company.categories.length > 0 ? (
                  <div className="flex gap-2.5">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[#00b14f]" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">
                        Lĩnh vực
                      </p>
                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {[
                          ...new Map(
                            job.company.categories.map(({ category }) => [
                              category.id,
                              category,
                            ]),
                          ).values(),
                        ].map((category) => (
                          <li key={category.id}>
                            <Link
                              href={`/jobs?categoryId=${category.id}`}
                              className="inline-block rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-800 transition hover:border-[#00b14f]/40 hover:bg-[#00b14f]/5"
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex justify-center">
                {website ? (
                  <a
                    href={
                      website.startsWith("http")
                        ? website
                        : `https://${website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#00b14f] hover:underline"
                  >
                    Website công ty
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              {job.employer?.user?.id ? (
                <JobContactEmployerCta
                  employerUserId={job.employer.user.id}
                  variant="featured"
                />
              ) : null}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Thông tin chung</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                  <dt className="text-gray-500">Ngành nghề</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {job.category.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                  <dt className="shrink-0 text-gray-500">Địa điểm làm việc</dt>
                  <dd className="max-w-[min(100%,14rem)] break-words text-right font-medium text-gray-900 sm:max-w-[min(100%,18rem)]">
                    {workplaceLocationDisplay}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                  <dt className="text-gray-500">Kinh nghiệm</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {experienceTypeLabel}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-gray-50 pb-3">
                  <dt className="text-gray-500">Hình thức</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {formatJobType(job.jobType)}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Hạn nộp</dt>
                  <dd className="text-right font-medium text-[#00b14f]">
                    {deadlineLabel}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatExperienceType(level?: string | null) {
  const text = String(level ?? "").trim();
  if (!text) return "—";
  const normalized = text.replace(/_/g, " ").toLowerCase();
  return normalized.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function JobDescriptionBody({ parsed }: { parsed: ParsedJobDescription }) {
  if (parsed.kind === "plain") {
    return <DescBulletOrParagraph text={parsed.text} />;
  }
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          Mô tả công việc
        </h3>
        <DescMotaBlock text={parsed.mota} />
      </div>
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          Yêu cầu ứng viên
        </h3>
        <DescBulletOrParagraph text={parsed.yeucau} />
      </div>
      <div>
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          Quyền lợi
        </h3>
        <DescBulletOrParagraph text={parsed.quyenloi} />
      </div>
    </div>
  );
}

function DescBulletOrParagraph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const bullets = lines.filter((l) => /^\s*-\s/.test(l));
  if (bullets.length > 0 && bullets.length === lines.length) {
    return (
      <ul
        className={`list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-gray-700 ${className ?? ""}`}
      >
        {bullets.map((line, i) => (
          <li key={i}>{line.replace(/^\s*-\s*/, "").trim()}</li>
        ))}
      </ul>
    );
  }
  return (
    <p
      className={`whitespace-pre-line text-[15px] leading-relaxed text-gray-700 ${className ?? ""}`}
    >
      {text}
    </p>
  );
}

function DescMotaBlock({ text }: { text: string }) {
  const chunks = text.split(/\n\s*\n/);
  if (chunks.length < 2) {
    return <DescBulletOrParagraph text={text} />;
  }
  const head = chunks[0]!.trim();
  const tail = chunks.slice(1).join("\n\n").trim();
  const tailLines = tail.split("\n").filter((l) => l.trim().length > 0);
  const allBullets = tailLines.every((l) => /^\s*-\s/.test(l));
  if (!allBullets) {
    return <DescBulletOrParagraph text={text} />;
  }
  return (
    <>
      <p className="mb-4 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">
        {head}
      </p>
      <DescBulletOrParagraph text={tail} />
    </>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00b14f] text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#00b14f]">{icon}</span>
      <div>
        <span className="text-gray-500">{label}: </span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
        <span className="h-6 w-1 rounded-full bg-[#00b14f]" />
        {title}
      </h2>
      {children}
    </div>
  );
}
