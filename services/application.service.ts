import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { MyApplication } from "@/app/types/application.type";

export const applicationService = {
  async applyJob(payload: {
    jobId: number;
    resumeId: number;
    coverLetter?: string;
  }) {
    try {
      const { data } = await axiosClient.post("/users/applications", payload);
      return data as { success: boolean; data?: { id: number } };
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getMyApplication(id: number): Promise<MyApplication | null> {
    try {
      const { data } = await axiosClient.get<{
        success: boolean;
        data: MyApplication;
      }>(`/users/applications/${encodeURIComponent(String(id))}`);
      return data?.data ?? null;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getMyApplications(): Promise<MyApplication[]> {
    try {
      const { data } = await axiosClient.get<{
        success: boolean;
        data: MyApplication[];
      }>("/users/applications");
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getAppliedJobIds(): Promise<number[]> {
    try {
      const { data } = await axiosClient.get<{
        success: boolean;
        data: { jobIds: number[] };
      }>("/users/applications/applied-job-ids");
      return Array.isArray(data.data?.jobIds) ? data.data.jobIds : [];
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
