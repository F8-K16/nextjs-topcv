import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
  phone: string;
  roles: number[];
};

export type UpdateUserPayload = {
  email: string;
  username: string;
  password?: string;
  phone: string;
  roles: number[];
  isVerified?: boolean;
  isBlocked?: boolean;
};

export const userService = {
  async getUserById(userId: number) {
    try {
      const res = await axiosClient.get(`/admin/users/${userId}`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async createUser(data: CreateUserPayload) {
    try {
      const res = await axiosClient.post("/admin/users", data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async updateUser(userId: number, data: UpdateUserPayload) {
    try {
      const res = await axiosClient.put(`/admin/users/${userId}`, data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async deleteUser(userId: number) {
    try {
      const res = await axiosClient.delete(`/admin/users/${userId}`);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
