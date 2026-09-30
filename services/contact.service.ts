import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export const contactService = {
  async send(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    website?: string;
  }) {
    try {
      const { data } = await axiosClient.post<{
        success: boolean;
        message: string;
      }>("/contact", payload);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
