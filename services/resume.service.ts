import { CreateResumePayload, Resume } from "@/app/types/resume.type";
import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export const resumeService = {
  async createResume(data: CreateResumePayload) {
    try {
      const res = await axiosClient.post<Resume>("/admin/resumes", data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async updateResume(id: number, data: Partial<CreateResumePayload>) {
    try {
      const res = await axiosClient.put<Resume>(`/admin/resumes/${id}`, data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async deleteResume(id: number) {
    try {
      const res = await axiosClient.delete<{ success: boolean }>(
        `/admin/resumes/${id}`,
      );
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getMyResumes() {
    try {
      const { data } = await axiosClient.get("/users/resumes");
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async uploadMyResume(payload: { title: string; fileUrl: string }) {
    const { data } = await axiosClient.post("/users/resumes", payload);
    return data;
  },
  deleteMyResume(id: number) {
    return axiosClient.delete(`/users/resumes/${id}`);
  },
};
