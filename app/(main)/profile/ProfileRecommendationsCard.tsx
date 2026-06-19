"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";

export default function ProfileRecommendationsCard() {
  const hideCandidateFeatures = useAuthenticatedNonCandidate();

  if (hideCandidateFeatures) {
    return null;
  }

  return (
    <Link
      href="/profile/recommendations"
      className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#00b14f]/40 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00b14f]/10 text-[#00b14f]">
          <Sparkles className="h-5 w-5" />
        </span>

        <p className="font-semibold text-gray-900">
          Sở thích &amp; gợi ý việc làm
        </p>
      </div>
      <span className="text-sm font-medium text-[#00b14f]">Mở →</span>
    </Link>
  );
}
