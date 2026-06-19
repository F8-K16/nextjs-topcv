"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import CvCanvas from "@/app/(main)/cv/_components/CvCanvas";
import { cvService } from "@/services/cv.service";
import { STALE_CV_DETAIL_MS } from "@/lib/query-stale-time";

export default function SharedResumePage() {
  const params = useParams<{ cvId: string }>();
  const cvId = Number(params?.cvId);

  const { data: cv, isLoading, isError } = useQuery({
    queryKey: ["shared-resume-cv", cvId],
    queryFn: () => cvService.getPublicCv(cvId),
    enabled: Number.isFinite(cvId),
    staleTime: STALE_CV_DETAIL_MS,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (isError || !cv) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-red-700">
        Không tìm thấy CV hoặc CV chưa được công khai.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="truncate text-lg font-semibold text-slate-900">{cv.title}</h1>
        <Link
          href="/"
          className="text-sm font-semibold text-[#00b14f] hover:underline"
        >
          Về trang chủ
        </Link>
      </div>
      <CvCanvas
        templateData={cv.template.templateData}
        content={cv.content}
        readOnly
      />
    </div>
  );
}
