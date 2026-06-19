import axiosClient from "@/lib/axios";
import type { Job } from "@/app/types/job.type";

export type RecommendationPreference = {
  id: number;
  candidateId: number;
  desiredMinSalary: number | null;
  desiredMaxSalary: number | null;
  jobType: string | null;
  experienceLevel: string | null;
  preferredProvinceId: number | null;
  preferredDistrictId: number | null;
  isOpenToRemote: boolean;
  preferredProvince: { id: number; name: string } | null;
  preferredDistrict: { id: number; name: string } | null;
};

export type RecommendationProfileResponse = {
  preference: RecommendationPreference | null;
  skillIds: number[];
  categoryIds: number[];
};

export type RecommendationProfilePutBody = {
  desiredMinSalary?: number | null;
  desiredMaxSalary?: number | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  preferredProvinceId?: number | null;
  preferredDistrictId?: number | null;
  isOpenToRemote?: boolean;
  skillIds?: number[];
  categoryIds?: number[];
};

export async function fetchRecommendationProfile(): Promise<RecommendationProfileResponse> {
  const { data } = await axiosClient.get<RecommendationProfileResponse>(
    "/me/recommendation-profile",
  );
  return data;
}

export async function putRecommendationProfile(
  body: RecommendationProfilePutBody,
): Promise<RecommendationProfileResponse> {
  const { data } = await axiosClient.put<RecommendationProfileResponse>(
    "/me/recommendation-profile",
    body,
  );
  return data;
}

export type SkillOption = { id: number; name: string };

export async function fetchSkillsPublic(): Promise<SkillOption[]> {
  const { data } = await axiosClient.get<{ skills: SkillOption[] }>("/skills");
  return data.skills;
}

export type RecommendedJobsListResponse = {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  JOB_TYPE_OPTIONS: { value: string; label: string }[];
  EXPERIENCE_OPTIONS: { value: string; label: string }[];
  SalaryRange: Record<string, string>;
  SalaryRangeOptions: { value: string; label: string }[];
  JOB_MODERATION_OPTIONS: { value: string; label: string }[];
};

export async function fetchRecommendedJobs(params: {
  page: number;
  limit: number;
}): Promise<RecommendedJobsListResponse> {
  const { data } = await axiosClient.get<RecommendedJobsListResponse>(
    "/jobs/recommended",
    { params },
  );
  return data;
}
