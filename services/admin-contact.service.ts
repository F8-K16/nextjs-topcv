import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export const adminContactService = {
  async list(params: URLSearchParams) {
    try {
      const { data } = await axiosClient.get<{
        messages: AdminContactMessage[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/admin/contact-messages?${params.toString()}`);
      return data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
