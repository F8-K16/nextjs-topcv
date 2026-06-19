"use client";

import Link from "next/link";
import { FileText, Upload } from "lucide-react";

import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";

export default function ResumePageHeader() {
  const hideCandidateActions = useAuthenticatedNonCandidate();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00b14f]/20 bg-white px-3 py-1 text-xs font-medium text-[#00b14f]">
          <FileText className="h-3.5 w-3.5" />
          Hồ sơ ứng tuyển
        </div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          CV của bạn
        </h1>
        <p className="mt-1 hidden text-sm text-gray-500 sm:block">
          Danh sách hồ sơ ứng tuyển
        </p>
      </div>

      {!hideCandidateActions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href="/resumes/upload"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-5 text-sm font-semibold text-white transition hover:bg-[#009944] sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            Tải CV
          </Link>
          <Link
            href="/cv/templates"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            Tạo CV
          </Link>
        </div>
      ) : null}
    </header>
  );
}
