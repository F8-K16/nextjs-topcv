import { SavedJobWithJob } from "@/app/types/job.type";
import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export const savedJobService = {
  async getSavedJobs(): Promise<SavedJobWithJob[]> {
    try {
      const res = await axiosClient.get(`/jobs/saved`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async saveJob(jobId: number) {
    try {
      const res = await axiosClient.post(`/jobs/${jobId}/saved`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async unsaveJob(jobId: number) {
    try {
      const res = await axiosClient.delete(`/jobs/${jobId}/saved`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async checkSaved(jobId: number) {
    try {
      const res = await axiosClient.get(`/jobs/${jobId}/check`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
