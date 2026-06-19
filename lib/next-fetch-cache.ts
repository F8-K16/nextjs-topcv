export const nextFetchCache = {
  dynamic: { cache: "no-store" as const },
  catalog: { next: { revalidate: 450, tags: ["api-metadata"] as string[] } },
  jobList: { next: { revalidate: 240, tags: ["api-jobs-public"] as string[] } },
  jobDetail: {
    next: { revalidate: 120, tags: ["api-job-detail"] as string[] },
  },
  companyList: {
    next: { revalidate: 180, tags: ["api-companies-public"] as string[] },
  },
  companyDetail: {
    next: { revalidate: 120, tags: ["api-company-detail"] as string[] },
  },
  topHiring: {
    next: { revalidate: 240, tags: ["api-top-hiring"] as string[] },
  },

  default: { next: { revalidate: 60 } },
} as const;
