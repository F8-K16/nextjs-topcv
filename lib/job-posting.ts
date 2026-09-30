import { jobPublicPath } from "./job-path";

export type JobPostingInput = {
  id: number;
  slug?: string | null;
  title: string;
  description: string;
  createdAt: string;
  deadline?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  workLocation?: string | null;
  company?: {
    name?: string | null;
    website?: string | null;
    logo?: string | null;
    location?: string | null;
    province?: { name?: string | null } | null;
  } | null;
};

function stripText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function employmentType(jobType?: string | null, experienceLevel?: string | null) {
  if (experienceLevel === "INTERN") return "INTERN";
  if (jobType === "PART_TIME") return "PART_TIME";
  if (jobType === "FREELANCE") return "CONTRACTOR";
  return "FULL_TIME";
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    "http://localhost:3001";
  return raw.replace(/\/$/, "");
}

export function buildJobPostingJsonLd(job: JobPostingInput, siteUrl = getSiteUrl()) {
  const companyName = job.company?.name?.trim() || "Nhà tuyển dụng";
  const locality =
    job.workLocation?.trim() ||
    job.company?.province?.name?.trim() ||
    job.company?.location?.trim() ||
    "Việt Nam";
  const description = stripText(job.description).slice(0, 5000) || job.title;
  const posting: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: job.createdAt,
    employmentType: employmentType(job.jobType, job.experienceLevel),
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      ...(job.company?.logo ? { logo: job.company.logo } : {}),
      ...(job.company?.website ? { sameAs: job.company.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: locality.slice(0, 180),
        addressCountry: "VN",
      },
    },
    identifier: {
      "@type": "PropertyValue",
      name: companyName,
      value: String(job.id),
    },
    url: `${siteUrl}${jobPublicPath({ id: job.id, slug: job.slug })}`,
    directApply: true,
  };
  if (job.deadline) posting.validThrough = job.deadline;
  const min = job.minSalary ?? 0;
  const max = job.maxSalary ?? 0;
  if (min > 0 || max > 0) {
    posting.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "VND",
      value: {
        "@type": "QuantitativeValue",
        ...(min > 0 ? { minValue: min } : {}),
        ...(max > 0 ? { maxValue: max } : {}),
        unitText: "MONTH",
      },
    };
  }
  return posting;
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
