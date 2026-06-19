"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/app/stores/auth.store";
import { buildAccessDeniedClientPath } from "@/lib/access-denied-notice";

const MSG_WAIT = "Đang kiểm tra quyền truy cập…";

const ADMIN_ROLES = ["ADMIN", "MODERATOR", "SUPPORT"] as const;

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loadingAuth, isAuthenticated } = useAuthStore();

  const canAccess = Boolean(
    user?.roles?.some((r) => (ADMIN_ROLES as readonly string[]).includes(r)),
  );

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/admin");
      return;
    }
    if (!canAccess) {
      router.replace(buildAccessDeniedClientPath());
    }
  }, [loadingAuth, isAuthenticated, canAccess, router]);

  if (loadingAuth || !isAuthenticated || !canAccess) {
    return (
      <div className="flex min-h-[32vh] items-center justify-center text-sm text-zinc-500">
        {MSG_WAIT}
      </div>
    );
  }

  return <>{children}</>;
}

