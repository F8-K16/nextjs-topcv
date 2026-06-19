"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";

import CvCanvas from "@/app/(main)/cv/_components/CvCanvas";
import type { EmployerSuggestedCandidateCvResponse } from "@/services/employer-portal.service";
import { employerPortalService } from "@/services/employer-portal.service";
import { EmployerQueryError, EmployerQueryLoading } from "../../../employer-query-ui";
import { STALE_EMPLOYER_SUGGESTED_CANDIDATES_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import StartConversationNav from "@/app/(main)/components/chat/StartConversationNav";
import { formatDate } from "@/utils/helper";

export default function EmployerCandidateCvPageClient() {
  const params = useParams();
  const userId = useAuthStore((s) => s.user?.id);
  const raw = params.candidateId;
  const candidateId = typeof raw === "string" ? Number(raw) : Number.NaN;

  const { data, isPending, isError, error, refetch } = useQuery<
    EmployerSuggestedCandidateCvResponse
  >({
    queryKey: ["employer-suggested-candidate-cv", userId, candidateId],
    queryFn: () => employerPortalService.getSuggestedCandidateCv(candidateId),
    enabled: userId != null && Number.isFinite(candidateId) && candidateId > 0,
    staleTime: STALE_EMPLOYER_SUGGESTED_CANDIDATES_MS,
  });

  if (userId == null || !Number.isFinite(candidateId) || candidateId < 1) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-800">
        Đường dẫn ứng viên không hợp lệ.
      </div>
    );
  }

  if (isPending) {
    return <EmployerQueryLoading />;
  }

  if (isError || !data) {
    return (
      <EmployerQueryError error={error} onRetry={() => void refetch()} />
    );
  }

  const { candidate, resume } = data;
  const preview = resume?.preview;
  const location = [candidate.district?.name, candidate.province?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          href="/employer/suggestions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Gợi ý ứng viên
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {candidate.user.username}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{candidate.user.email}</p>
        {location ? (
          <p className="mt-1 text-xs text-zinc-500">{location}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <StartConversationNav
          peerUserId={candidate.user.id}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-80"
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          Nhắn tin
        </StartConversationNav>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">CV</h2>
          {resume ? (
            <p className="mt-0.5 text-xs text-zinc-500">
              {resume.title}
              {" · "}
              Cập nhật {formatDate(resume.updatedAt)}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-zinc-500">
              Ứng viên chưa có hồ sơ trong hệ thống
            </p>
          )}
        </div>

        <div className="p-4">
          {!preview ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-12 text-center">
              <FileText className="h-10 w-10 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-700">
                Chưa có CV
              </p>
              <p className="max-w-md text-xs text-zinc-500">
                Bạn vẫn có thể liên hệ qua tin nhắn.
              </p>
            </div>
          ) : preview.kind === "template" ? (
            <div className="max-h-[min(75vh,720px)] overflow-y-auto rounded-xl border border-zinc-100 bg-white p-3">
              <CvCanvas
                templateData={preview.cv.template.templateData}
                content={preview.cv.content}
                readOnly
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">
                Xem nhanh file đính kèm (PDF hoặc host lưu trữ — trình duyệt có thể
                chặn nội dung từ nguồn khác).
              </p>
              <div className="min-h-[min(55vh,560px)] w-full overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50 p-2">
                <iframe
                  title="CV ứng viên"
                  src={preview.fileUrl}
                  className="h-[min(70vh,680px)] w-full rounded-lg bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
