import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type AppNotification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export const notificationService = {
  async list(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      if (params?.unreadOnly) sp.set("unreadOnly", "true");
      const qs = sp.toString();
      const { data } = await axiosClient.get<{
        success: boolean;
        data: {
          notifications: AppNotification[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      }>(`/users/notifications${qs ? `?${qs}` : ""}`);
      return data.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async unreadCount(): Promise<number> {
    try {
      const { data } = await axiosClient.get<{
        success: boolean;
        data: { count: number };
      }>("/users/notifications/unread-count");
      return typeof data.data?.count === "number" ? data.data.count : 0;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async markRead(id: number) {
    try {
      await axiosClient.patch(`/users/notifications/${id}/read`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async markAllRead() {
    try {
      await axiosClient.post("/users/notifications/read-all");
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getById(id: number): Promise<AppNotification> {
    try {
      const { data } = await axiosClient.get<{
        success: boolean;
        data: AppNotification;
      }>(`/users/notifications/${id}`);
      return data.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
