import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import RecommendedJobsClient from "./RecommendedJobsClient";
import RecommendedJobsPageIntro from "./RecommendedJobsPageIntro";

export const metadata: Metadata = {
  title: "Việc làm gợi ý",
  description:
    "Danh sách việc làm được gợi ý theo hồ sơ và sở thích của bạn.",
};

export default function RecommendedJobsPage() {
  return (
    <main className="min-h-[60vh] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_45%,#f4f4f5_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Tất cả việc làm
        </Link>

        <RecommendedJobsPageIntro />

        <RecommendedJobsClient />
      </div>
    </main>
  );
}
