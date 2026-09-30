"use server";

import { loginSchema } from "@/app/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { cookies } from "next/headers";
import { decodeToken } from "@/utils/jwt";

import type { User } from "@/app/stores/auth.store";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};

export type LoginState = {
  success?: boolean;
  roles?: string[];
  error?: string;
  twoFactorRequired?: boolean;
  twoFactorSetupRequired?: boolean;
  challengeToken?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;
  const res = await authService.requestLogin({ email, password });

  if (!res.success) {
    return {
      error: res.message,
    };
  }

  if (res.data.twoFactorRequired && res.data.challengeToken) {
    return {
      twoFactorRequired: true,
      challengeToken: res.data.challengeToken,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("accessToken", res.data.accessToken, cookieBase);
  cookieStore.set("refreshToken", res.data.refreshToken, cookieBase);

  const roles = decodeToken(res.data.accessToken)?.roles ?? [];

  return {
    success: true,
    roles,
    twoFactorSetupRequired: Boolean(res.data.twoFactorSetupRequired),
  };
}

export async function verifyTwoFactorAction(input: {
  challengeToken: string;
  code: string;
}): Promise<LoginState> {
  const res = await authService.verifyAdminTotp(input);
  if (!res.success || !res.data?.accessToken || !res.data.refreshToken) {
    return { error: res.message || "Mã xác thực không đúng" };
  }
  const cookieStore = await cookies();
  cookieStore.set("accessToken", res.data.accessToken, cookieBase);
  cookieStore.set("refreshToken", res.data.refreshToken, cookieBase);
  const roles = decodeToken(res.data.accessToken)?.roles ?? [];
  return { success: true, roles };
}

export const verifyAction = async (email: string, code: string) => {
  const res = await authService.requestVerifyEmail({ email, code });

  if (!res.success) {
    return {
      success: false,
      message: res.message,
    };
  }
  const data = res.data.data;
  if (data.needsApproval) {
    return {
      success: true,
      data: {
        needsApproval: true,
        isEmployer: Boolean(data.isEmployer),
      },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("accessToken", res.data.data.accessToken, cookieBase);
  cookieStore.set("refreshToken", res.data.data.refreshToken, cookieBase);

  return {
    success: true,
    data: {
      needsApproval: false,
      isEmployer: Boolean(data.isEmployer),
    },
  };
};

export const logoutAction = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken || !accessToken) return;

  const res = await authService.requestLogout(accessToken, refreshToken);

  if (!res.success) {
    return {
      success: false,
      message: res.message,
    };
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return {
    success: true,
  };
};

export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    return false;
  }

  const res = await authService.getProfile(accessToken);

  if (!res.success) {
    return;
  }

  return { data: res.data.data, accessToken };
};

export async function hydrateAuthAction(): Promise<{
  user: User;
  accessToken: string;
} | null> {
  const tokens = await getToken();
  let accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;
  if (!accessToken || !refreshToken) return null;

  const loadProfile = async (token: string) => {
    const res = await authService.getProfile(token);
    if (!res.success || !res.data?.data) return null;
    return { user: res.data.data as User, accessToken: token };
  };

  let session = await loadProfile(accessToken);
  if (session) return session;

  try {
    const body = (await authService.requestRefreshToken(refreshToken)) as {
      data?: { accessToken: string; refreshToken: string };
    };
    const next = body?.data;
    if (!next?.accessToken || !next.refreshToken) {
      await removeToken();
      return null;
    }
    await saveToken(next);
    accessToken = next.accessToken;
  } catch {
    await removeToken();
    return null;
  }

  session = await loadProfile(accessToken);
  if (!session) {
    await removeToken();
    return null;
  }
  return session;
}

export const saveToken = async (newToken: {
  accessToken: string;
  refreshToken: string;
}) => {
  const cookieStore = await cookies();
  cookieStore.set(`accessToken`, newToken.accessToken, cookieBase);
  cookieStore.set(`refreshToken`, newToken.refreshToken, cookieBase);
};

export const getToken = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  return { accessToken, refreshToken };
};

export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
};
