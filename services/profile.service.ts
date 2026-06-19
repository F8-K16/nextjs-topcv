import axiosClient from "@/lib/axios";

export const profileService = {
  async updateProfile(data: {
    username: string;
    email: string;
    phone: string;
    avatar?: string;
    provinceId?: number;
    districtId?: number;
    receiveEmailNotifications: boolean;
  }) {
    return axiosClient.patch("/users/profile", data);
  },

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return axiosClient.patch("/users/password", data);
  },
};
