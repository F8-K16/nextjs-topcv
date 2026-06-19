import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type ClearApplicationCacheResult = {
  keysDeleted: number;
};

export const adminCacheService = {
  async clearApplicationCache(): Promise<ClearApplicationCacheResult> {
    try {
      const res = await axiosClient.post<{
        data: ClearApplicationCacheResult;
        message?: string;
      }>("/admin/cache/application");
      return res.data.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
