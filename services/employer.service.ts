import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export const employerService = {
  async approve(id: number) {
    try {
      await axiosClient.post(`/admin/employers/${id}/approval`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async approveAllPending() {
    try {
      const res = await axiosClient.post<{
        message: string;
        approved: number;
        totalPending: number;
      }>("/admin/employers/approve-all");
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async reject(id: number, reason: string) {
    try {
      await axiosClient.post(`/admin/employers/${id}/rejected`, {
        reason,
      });
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  async getByCompany(companyId: number) {
    try {
      const res = await axiosClient.get(
        `/admin/company/${companyId}/employers`,
      );
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
