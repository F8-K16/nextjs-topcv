import type { Metadata } from "next";
import { Suspense } from "react";

import AccessControlPageInner from "./AccessControlPageInner";

export const metadata: Metadata = {
  title: "Phân quyền",
  description: "Quản lý vai trò và quyền hạn trong hệ thống.",
};

export default function AdminAccessControlPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
        </div>
      }
    >
      <AccessControlPageInner />
    </Suspense>
  );
}
