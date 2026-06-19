import { useEffect, useRef } from "react";

import { decodeToken } from "@/utils/jwt";
import { authService } from "@/services/auth.service";
import {
  getToken,
  hydrateAuthAction,
  removeToken,
  saveToken,
} from "../app/actions/auth.action";
import { useAuthStore } from "../app/stores/auth.store";
import { useMetadataStore } from "../app/stores/metadata.store";

const REFRESH_BEFORE_EXPIRY_SEC = 60;

export default function useAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoadingAuth = useAuthStore((s) => s.setLoadingAuth);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const accessToken = useAuthStore((s) => s.accessToken);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMeta = useMetadataStore((s) => s.fetchMeta);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoadingAuth(true);
      const metaInit = fetchMeta();
      try {
        const [session] = await Promise.all([hydrateAuthAction(), metaInit]);
        if (cancelled) return;
        if (!session) {
          clearAuth();
          return;
        }
        setAuth(session.user, session.accessToken);
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setLoadingAuth(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [setAuth, clearAuth, setLoadingAuth, fetchMeta]);

  useEffect(() => {
    if (!accessToken) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const scheduleRefresh = async () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const { refreshToken } = await getToken();
      if (cancelled || !refreshToken) return;

      const payload = decodeToken(token);
      if (!payload?.exp) return;

      const now = Date.now() / 1000;
      const timeLeft = payload.exp - now;
      const refreshMs = (timeLeft - REFRESH_BEFORE_EXPIRY_SEC) * 1000;

      const refreshNow = async (rt: string) => {
        try {
          const body = (await authService.requestRefreshToken(rt)) as {
            data?: { accessToken: string; refreshToken: string };
          };
          const next = body?.data;
          if (!next?.accessToken || !next?.refreshToken) {
            await removeToken();
            clearAuth();
            window.location.reload();
            return;
          }
          await saveToken(next);
          setAccessToken(next.accessToken);
        } catch {
          await removeToken();
          clearAuth();
          window.location.reload();
        }
      };

      if (refreshMs <= 0) {
        await refreshNow(refreshToken);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        void refreshNow(refreshToken);
      }, refreshMs);
    };

    void scheduleRefresh();

    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [accessToken, setAccessToken, clearAuth]);
}
