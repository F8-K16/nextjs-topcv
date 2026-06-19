import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { AdminDashboardSummary } from "@/types/admin-dashboard.types";

export const adminDashboardService = {
  async getSummary(): Promise<AdminDashboardSummary> {
    try {
      const res = await axiosClient.get<{ success: boolean; data: AdminDashboardSummary }>(
        "/admin/dashboard/summary",
      );
      return res.data.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
