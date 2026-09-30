import axiosClient from "@/lib/axios";

export const adminSecurityService = {
  async setup() {
    const { data } = await axiosClient.post<{
      secret: string;
      otpauthUrl: string;
      qrDataUrl: string;
    }>("/auth/2fa/setup");
    return data;
  },
  async enable(code: string) {
    const { data } = await axiosClient.post<{ totpEnabled: boolean }>(
      "/auth/2fa/enable",
      { code },
    );
    return data;
  },
  async disable(password: string, code: string) {
    const { data } = await axiosClient.post<{ totpEnabled: boolean }>(
      "/auth/2fa/disable",
      { password, code },
    );
    return data;
  },
};
