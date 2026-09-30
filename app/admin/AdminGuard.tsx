"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/app/stores/auth.store";
import { buildAccessDeniedClientPath } from "@/lib/access-denied-notice";

const MSG_WAIT = "Đang kiểm tra quyền truy cập…";

const ADMIN_ROLES = ["ADMIN", "MODERATOR", "SUPPORT"] as const;

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loadingAuth, isAuthenticated } = useAuthStore();

  const canAccess = Boolean(
    user?.roles?.some((r) => (ADMIN_ROLES as readonly string[]).includes(r)),
  );
  const needsTwoFactor =
    Boolean(user?.roles?.includes("ADMIN")) && user?.totpEnabled !== true;
  const onSecurityPage = pathname === "/admin/security";

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/admin");
      return;
    }
    if (!canAccess) {
      router.replace(buildAccessDeniedClientPath());
      return;
    }
    if (needsTwoFactor && !onSecurityPage) {
      router.replace("/admin/security");
    }
  }, [
    loadingAuth,
    isAuthenticated,
    canAccess,
    needsTwoFactor,
    onSecurityPage,
    router,
  ]);

  if (
    loadingAuth ||
    !isAuthenticated ||
    !canAccess ||
    (needsTwoFactor && !onSecurityPage)
  ) {
    return (
      <div className="flex min-h-[32vh] items-center justify-center text-sm text-zinc-500">
        {MSG_WAIT}
      </div>
    );
  }

  return <>{children}</>;
}

