"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/app/stores/auth.store";
import { buildAccessDeniedClientPath } from "@/lib/access-denied-notice";

const MSG_WAIT = "Đang kiểm tra quyền truy cập…";

export default function EmployerGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loadingAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (loadingAuth) return;
    if (!isAuthenticated) {
      router.replace("/auth/login?redirect=/employer");
      return;
    }
    if (!user?.roles?.includes("EMPLOYER")) {
      router.replace(buildAccessDeniedClientPath());
    }
  }, [loadingAuth, isAuthenticated, user, router]);

  if (loadingAuth || !isAuthenticated || !user?.roles?.includes("EMPLOYER")) {
    return (
      <div className="flex min-h-[32vh] items-center justify-center text-sm text-zinc-500">
        {MSG_WAIT}
      </div>
    );
  }

  return <>{children}</>;
}
