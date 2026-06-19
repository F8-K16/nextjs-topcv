import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import RecommendationsForm from "./RecommendationsForm";

export const metadata: Metadata = {
  title: "Sở thích gợi ý việc làm",
  description: "Thiết lập ngành nghề, khu vực và mức lương mong muốn.",
};

export default function RecommendationsPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f3f5f7] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#00b14f]"
        >
          <ArrowLeft className="h-4 w-4" />
          Tài khoản
        </Link>

        <header>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00b14f]/12 text-[#00b14f]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sở thích &amp; gợi ý việc làm
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Thiết lập để hệ thống ưu tiên tin phù hợp kỹ năng, khu vực và
                mức lương mong muốn của bạn.
              </p>
            </div>
          </div>
        </header>

        <RecommendationsForm />
      </div>
    </div>
  );
}
