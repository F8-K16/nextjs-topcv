import { RegisterPayload, RegisterResponse } from "@/app/types/auth.type";
import { API_BASE_URL } from "@/lib/api-base-url";

export const authService = {
  async requestGoogleLogin(code: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/google/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || "Đăng nhập Google thất bại",
        };
      }
      return {
        success: true,
        data: data as {
          accessToken: string;
          refreshToken: string;
          user: import("@/app/stores/auth.store").User;
        },
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối server",
      };
    }
  },

  async requestLogin(loginData: { email: string; password: string }) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data?.message || "Sai email hoặc mật khẩu",
        };
      }
      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối server",
      };
    }
  },

  async requestVerifyEmail(payload: { email: string; code: string }) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Xác thực thất bại",
        };
      }

      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối server",
      };
    }
  },

  async getProfile(accessToken: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || "Unauthorized",
        };
      }
      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối server",
      };
    }
  },

  async requestRefreshToken(refreshToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      },
    );
    if (!response.ok) {
      throw new Error("Refresh token failed");
    }
    return response.json();
  },

  async requestRegister(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const details = (data?.details ?? data?.errors) as
          | Record<string, unknown>
          | undefined;
        const errors = details
          ? Object.fromEntries(
              Object.entries(details).map(([k, v]) => [
                k,
                Array.isArray(v) ? String(v[0] ?? "") : String(v ?? ""),
              ]),
            )
          : undefined;
        return {
          success: false,
          message: data?.message || "Đăng ký thất bại",
          errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối server",
      };
    }
  },

  async requestLogout(accessToken: string, refreshToken: string) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Logout thất bại",
        };
      }

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối server",
      };
    }
  },

  async forgotPassword(email: string) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Không thể gửi mã",
        };
      }
      return { success: true, message: data?.message };
    } catch {
      return { success: false, message: "Không thể kết nối server" };
    }
  },

  async resetPassword(payload: {
    email: string;
    code: string;
    newPassword: string;
  }) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Đặt lại mật khẩu thất bại",
        };
      }
      return { success: true, message: data?.message };
    } catch {
      return { success: false, message: "Không thể kết nối server" };
    }
  },

  async resendResetOtp(email: string) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/resend-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Không gửi lại được mã",
        };
      }
      return { success: true, message: data?.message };
    } catch {
      return { success: false, message: "Không thể kết nối server" };
    }
  },

  async resendVerification(email: string) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.message || "Không gửi lại được mã",
        };
      }
      return { success: true, message: data?.message };
    } catch {
      return { success: false, message: "Không thể kết nối server" };
    }
  },
};
