import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type SiteSettings = {
  id: number;
  siteName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  maintenanceMode: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SiteSettingsUpdate = Partial<
  Omit<SiteSettings, "id" | "createdAt" | "updatedAt">
>;

export const adminSettingsService = {
  async get(): Promise<SiteSettings> {
    try {
      const res = await axiosClient.get<{ data: SiteSettings }>(
        "/admin/settings",
      );
      return res.data.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async update(payload: SiteSettingsUpdate): Promise<SiteSettings> {
    try {
      const res = await axiosClient.put<{ data: SiteSettings }>(
        "/admin/settings",
        payload,
      );
      return res.data.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
