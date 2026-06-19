import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { Company } from "@/app/types/company.type";

export type FollowedCompanyRow = {
  followedAt: string;
  company: Company & {
    _count?: { jobs: number };
  };
};

export const companyFollowService = {
  async listFollowed(): Promise<FollowedCompanyRow[]> {
    try {
      const res = await axiosClient.get<{ companies: FollowedCompanyRow[] }>(
        "/companies/followed",
      );
      return res.data.companies ?? [];
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async follow(companyId: number) {
    try {
      const res = await axiosClient.post(`/companies/${companyId}/follow`);
      return res.data as { following: boolean };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async unfollow(companyId: number) {
    try {
      const res = await axiosClient.delete(`/companies/${companyId}/follow`);
      return res.data as { following: boolean };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async check(companyId: number) {
    try {
      const res = await axiosClient.get<{ following: boolean }>(
        `/companies/${companyId}/follow/check`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
