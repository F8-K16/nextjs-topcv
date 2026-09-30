import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogAdminInner } from "./BlogAdminInner";

export const metadata: Metadata = {
  title: "Blog",
  description: "Quản lý bài viết cẩm nang nghề nghiệp.",
};

export default function AdminBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
      }
    >
      <BlogAdminInner />
    </Suspense>
  );
}
