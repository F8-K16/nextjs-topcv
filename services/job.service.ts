import { CreateJobPayload, Job, JobsResponse } from "@/app/types/job.type";
import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import { API_BASE_URL } from "@/lib/api-base-url";

export const jobService = {
  async getJobs(query: string): Promise<JobsResponse> {
    const base = API_BASE_URL;
    if (!base) {
      throw new Error("Thiếu NEXT_PUBLIC_API_URL (URL API backend).");
    }
    const url = `${base.replace(/\/$/, "")}/jobs?${query}`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `API /jobs lỗi ${res.status}: ${text.slice(0, 200) || res.statusText}`,
        );
      }
      return res.json() as Promise<JobsResponse>;
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("API /jobs")) throw e;
      throw new Error("Đã có lỗi khi tải danh sách việc làm");
    }
  },
  async suggestJobs(q: string): Promise<{
    suggestions: Array<{
      kind: "job" | "company" | "category" | "skill";
      text: string;
    }>;
  }> {
    try {
      const res = await axiosClient.get("/jobs/suggest", {
        params: { q },
        headers: { Accept: "application/json" },
      });
      return res.data as {
        suggestions: Array<{
          kind: "job" | "company" | "category" | "skill";
          text: string;
        }>;
      };
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async createJob(data: CreateJobPayload) {
    try {
      const res = await axiosClient.post<Job>("/admin/jobs", data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async updateJob(id: number, data: Partial<CreateJobPayload>) {
    try {
      const res = await axiosClient.put<Job>(`/admin/jobs/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async deleteJob(id: number) {
    try {
      const res = await axiosClient.delete<{ success: boolean }>(
        `/admin/jobs/${id}`,
      );
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async patchJobModeration(id: number, status: string) {
    try {
      const res = await axiosClient.patch<Job>(`/admin/jobs/${id}/moderation`, {
        status,
      });
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async approveAllPendingModeration() {
    try {
      const res = await axiosClient.post<{
        message: string;
        approved: number;
        totalPending: number;
      }>("/admin/jobs/approve-all-pending");
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async patchJobFeatured(id: number, isFeatured: boolean) {
    try {
      const res = await axiosClient.patch<Job>(`/admin/jobs/${id}/featured`, {
        isFeatured,
      });
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
