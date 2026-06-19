"use client";

import Link from "next/link";
import { FileText, FolderOpen } from "lucide-react";

import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";

export default function CvTemplatesHeader() {
  const hideCandidateActions = useAuthenticatedNonCandidate();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00b14f]/20 bg-white px-3 py-1 text-xs font-medium text-[#00b14f]">
          <FileText className="h-3.5 w-3.5" />
          Mẫu CV
        </div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Chọn mẫu CV phù hợp với bạn
        </h1>
        <p className="mt-1 hidden text-sm text-gray-500 md:block">
          Chọn 1 mẫu CV phù hợp với bạn. Các liên kết CV chia sẻ sẽ nằm trong
          khu vực hồ sơ ứng tuyển.
        </p>
      </div>

      {!hideCandidateActions ? (
        <Link
          href="/cv/my"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00b14f]/30 bg-white px-5 text-sm font-semibold text-[#00b14f] transition hover:bg-[#00b14f]/5 sm:w-auto"
        >
          <FolderOpen className="h-4 w-4" />
          CV nháp
        </Link>
      ) : null}
    </header>
  );
}
