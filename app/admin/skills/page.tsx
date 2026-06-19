import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillsPageInner } from "./SkillsPageInner";

export const metadata: Metadata = {
  title: "Kỹ năng",
  description: "Danh mục kỹ năng gắn với tin tuyển dụng và hồ sơ.",
};

export default function AdminSkillsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
        </div>
      }
    >
      <SkillsPageInner />
    </Suspense>
  );
}
