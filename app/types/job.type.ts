import { Province } from "../stores/location.store";

export type SelectOption = {
  value: string;
  label: string;
};

export type JobModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export const JOB_MODERATION_OPTIONS: SelectOption[] = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

export const JOB_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "FREELANCE", label: "Freelance" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: "INTERN", label: "Thực tập" },
  { value: "FRESHER", label: "Không yêu cầu" },
  { value: "JUNIOR", label: "1-2 năm" },
  { value: "MIDDLE", label: "3-5 năm" },
  { value: "SENIOR", label: "5-10 năm" },
  { value: "LEAD", label: "Trưởng nhóm" },
] as const;

export const SALARY_RANGE_OPTIONS = [
  { value: "under_10", label: "Dưới 10 triệu" },
  { value: "10_15", label: "10 - 15 triệu" },
  { value: "15_20", label: "15 - 20 triệu" },
  { value: "20_25", label: "20 - 25 triệu" },
  { value: "25_30", label: "25 - 30 triệu" },
  { value: "30_50", label: "30 - 50 triệu" },
  { value: "over_50", label: "Trên 50 triệu" },
  { value: "negotiable", label: "Thỏa thuận" },
] as const;

export type JobType = (typeof JOB_TYPE_OPTIONS)[number]["value"];
export type ExperienceLevel = (typeof EXPERIENCE_OPTIONS)[number]["value"];

export type Job = {
  id: number;
  slug?: string;
  title: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  quantity: number;

  jobType: JobType;
  experienceLevel: ExperienceLevel;

  moderationStatus?: JobModerationStatus;
  deadline?: string | null;
  isFeatured?: boolean;
  workLocation?: string | null;

  createdAt: string;
  updatedAt: string;

  employerId?: number | null;
  companyId: number;
  categoryId: number;

  employer?: {
    id: number;
    userId: number;
    user: { id: number; username: string };
  } | null;

  company: {
    id: number;
    slug?: string;
    name: string;
    logo?: string;
    website?: string | null;
    status: boolean;
    location?: string;

    description?: string | null;

    categories?: {
      category: { id: number; name: string; slug?: string };
    }[];

    province: {
      id: number;
      name: string;
    };
    district?: { id: number; name: string };
  };

  category: {
    id: number;
    name: string;
  };

  jobSkills?: { skill: { id: number; name: string } }[];

  _count?: {
    applications: number;
  };
};

export type JobsResponse = {
  jobs: Job[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  companies: {
    id: number;
    name: string;
  }[];

  categories: {
    id: number;
    name: string;
  }[];
  provinces?: Province[];
  JOB_TYPE_OPTIONS: SelectOption[];
  EXPERIENCE_OPTIONS: SelectOption[];
  SalaryRangeOptions: SelectOption[];
  JOB_MODERATION_OPTIONS?: SelectOption[];
};

export type CreateJobPayload = {
  title: string;
  description?: string;
  companyId: number;
  categoryId: number;
  employerId?: number;
  minSalary?: number;
  maxSalary?: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  quantity: number;
  moderationStatus?: JobModerationStatus;
  deadline?: string | null;
  isFeatured?: boolean;
  workLocation?: string | null;
  skillIds?: number[];
};

export type SavedJob = {
  candidateId: number;
  jobId: number;
  createdAt: string;
};

export type SavedJobWithJob = SavedJob & {
  job: Job;
};
