import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/app/stores/auth.store";
import { getToken, removeToken, saveToken } from "@/app/actions/auth.action";
import { API_BASE_URL } from "@/lib/api-base-url";

type RetryingRequest = InternalAxiosRequestConfig & { _retry?: boolean };

type QueueItem = {
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 25_000,
});

let accessTokenBootstrap: Promise<string | null> | null = null;

async function resolveAccessTokenForRequest(): Promise<string | null> {
  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) return fromStore;
  if (typeof window === "undefined") return null;

  if (!accessTokenBootstrap) {
    accessTokenBootstrap = (async () => {
      try {
        const { accessToken } = await getToken();
        if (accessToken) {
          useAuthStore.getState().setAccessToken(accessToken);
        }
        return accessToken ?? null;
      } catch {
        return null;
      } finally {
        accessTokenBootstrap = null;
      }
    })();
  }

  return accessTokenBootstrap;
}

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await resolveAccessTokenForRequest();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryingRequest | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = await getToken();

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const newToken = await authService.requestRefreshToken(refreshToken);

        if (!newToken) {
          throw new Error("Refresh failed");
        }

        const { accessToken } = newToken.data;

        await saveToken(newToken.data);

        useAuthStore.getState().setAccessToken(accessToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        await removeToken();

        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
