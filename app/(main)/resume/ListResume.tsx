"use client";

import { Resume } from "@/app/types/resume.type";
import { formatDate } from "@/utils/helper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { GC_DEFAULT_MS, STALE_MY_RESUMES_MS } from "@/lib/query-stale-time";
import { resumeService } from "@/services/resume.service";
import { cvService } from "@/services/cv.service";
import { useAuthStore } from "@/app/stores/auth.store";
import { requestAppConfirm } from "@/app/stores/confirm-dialog.store";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";
import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";
import { CvListItem } from "@/app/types/cv.type";
import { useCvDraftPrompt } from "@/hooks/useCvDraftPrompt";

type ResumeCardItem = {
  id: number;
  title: string;
  updatedAt?: string;
  createdAt?: string;
  viewUrl: string;
  thumbnailUrl?: string | null;
  source: "upload" | "template";
};

export default function ResumeList() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const hideCandidateFeatures = useAuthenticatedNonCandidate();
  const [hiddenPreviewKeys, setHiddenPreviewKeys] = useState<
    Record<string, boolean>
  >({});

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ["my-resumes", user?.id],
    queryFn: () => resumeService.getMyResumes(),
    staleTime: STALE_MY_RESUMES_MS,
    gcTime: GC_DEFAULT_MS,
    refetchOnWindowFocus: false,
    enabled: !!user?.id && isCandidate,
  });

  const { data: myCvs = [], isLoading: isCvsLoading } = useQuery<CvListItem[]>({
    queryKey: ["my-cvs", user?.id],
    queryFn: () => cvService.listMyCvs(),
    staleTime: STALE_MY_RESUMES_MS,
    gcTime: GC_DEFAULT_MS,
    refetchOnWindowFocus: false,
    enabled: !!user?.id && isCandidate,
  });

  useCvDraftPrompt({
    cvs: myCvs,
    enabled:
      !!user?.id && isCandidate && !hideCandidateFeatures && !isCvsLoading,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resumeService.deleteMyResume(id),
    onSuccess: () => {
      toast.success("Xóa CV thành công");
      queryClient.invalidateQueries({
        queryKey: ["my-resumes"],
      });
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });

  const deleteCvMutation = useMutation({
    mutationFn: (id: number) => cvService.deleteCv(id),
    onSuccess: () => {
      toast.success("Xóa CV thành công");
      queryClient.invalidateQueries({
        queryKey: ["my-cvs"],
      });
    },
    onError: () => {
      toast.error("Xóa thất bại");
    },
  });

  const handleDelete = async (id: number) => {
    const ok = await requestAppConfirm({
      title: "Xóa hồ sơ?",
      description: "Bạn có chắc muốn xóa CV này? Hành động không thể hoàn tác.",
      confirmLabel: "Xóa",
      variant: "destructive",
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  const handleDeleteTemplateCv = async (id: number) => {
    const ok = await requestAppConfirm({
      title: "Xóa CV?",
      description: "Bạn có chắc muốn xóa CV này? Hành động không thể hoàn tác.",
      confirmLabel: "Xóa",
      variant: "destructive",
    });
    if (!ok) return;
    deleteCvMutation.mutate(id);
  };

  const cardItems: ResumeCardItem[] = useMemo(
    () => [
      ...resumes
        .filter((resume) => !String(resume.fileUrl).includes("/resumes/shared/"))
        .map((resume) => ({
          id: resume.id,
          title: resume.title,
          updatedAt: resume.updatedAt,
          createdAt: resume.createdAt,
          viewUrl: resume.fileUrl,
          source: "upload" as const,
        })),
      ...myCvs
        .filter((cv) => cv.status === "COMPLETED")
        .map((cv) => ({
          id: cv.id,
          title: cv.title,
          updatedAt: cv.updatedAt,
          createdAt: cv.createdAt,
          viewUrl: `/resumes/shared/${cv.id}`,
          thumbnailUrl: null,
          source: "template" as const,
        })),
    ],
    [myCvs, resumes],
  );

  const uploadItems = cardItems.filter((i) => i.source === "upload");
  const templateItems = cardItems.filter((i) => i.source === "template");

  if (hideCandidateFeatures) {
    return (
      <CandidateOnlyNotice>
        Quản lý CV chỉ dành cho tài khoản ứng viên. Với nhà tuyển dụng, hãy dùng
        khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  if (isLoading || isCvsLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (uploadItems.length === 0 && templateItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/90 bg-linear-to-b from-slate-50/80 to-white py-16 text-center text-slate-600">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <FileText className="h-7 w-7 text-[#00b14f]/80" aria-hidden />
        </div>
        <p className="mt-4 max-w-sm mx-auto text-sm leading-relaxed">
          Bạn chưa có CV nào. Bạn có thể tải CV PDF hoặc tạo CV từ mẫu để ứng
          tuyển nhanh hơn.
        </p>
      </div>
    );
  }

  const renderCards = (items: ResumeCardItem[]) => {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {items.map((cv) => {
          const uploadKey = `upload-${cv.id}`;
          const previewUnavailable =
            (cv.source === "upload" && hiddenPreviewKeys[uploadKey]) ||
            (cv.source === "template" && !cv.thumbnailUrl);

          return (
            <div key={`${cv.source}-${cv.id}`} className="group">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/30 transition hover:border-[#00b14f]/25 hover:shadow-md hover:ring-[#00b14f]/10">
                <div className="relative aspect-4/3 min-h-100 overflow-hidden bg-linear-to-br from-[#e8f6ec] via-white to-slate-50">
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#00b14f]/[0.07]"
                    aria-hidden
                  />
                  {cv.source === "upload" && !hiddenPreviewKeys[uploadKey] ? (
                    <iframe
                      title={`preview-upload-${cv.id}`}
                      src={`${cv.viewUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
                      className="absolute inset-0 h-full w-full border-0 bg-white"
                      loading="lazy"
                      onError={() =>
                        setHiddenPreviewKeys((prev) => ({
                          ...prev,
                          [uploadKey]: true,
                        }))
                      }
                    />
                  ) : null}
                  {previewUnavailable ? (
                    <div className="absolute inset-0 bg-linear-to-br from-[#e8f6ec] via-white to-slate-50" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-t from-black/15 via-black/0 to-transparent" />
                  )}
                  <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {cv.source === "upload" ? "CV tải lên" : "CV từ mẫu"}
                  </div>
                  {previewUnavailable ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm transition group-hover:scale-[1.02] group-hover:shadow-md">
                        <FileText
                          className="mx-auto h-11 w-11 text-[#00b14f]"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 via-black/30 to-transparent p-3 text-white">
                    <p className="line-clamp-2 text-sm font-medium">
                      {cv.title}
                    </p>
                    <p className="mt-1 text-xs text-white/85">
                      {formatDate(cv.updatedAt ?? cv.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 bg-slate-50/50 px-3 py-3 sm:px-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                    <a
                      href={cv.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#00b14f] px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#009944] sm:w-auto sm:min-w-22"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      Xem CV
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        void (cv.source === "upload"
                          ? handleDelete(cv.id)
                          : handleDeleteTemplateCv(cv.id))
                      }
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 sm:w-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="space-y-3 md:space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            CV đã tải lên
          </h2>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Các file CV PDF bạn đã tải lên để ứng tuyển
          </p>
        </div>
        {uploadItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 py-10 text-center text-slate-600">
            <p className="text-sm">Bạn chưa tải CV nào.</p>
          </div>
        ) : (
          renderCards(uploadItems)
        )}
      </section>

      <section className="space-y-3 md:space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            CV đã tạo trên TopCV
          </h2>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            CV tạo từ mẫu và đã hoàn tất
          </p>
        </div>
        {templateItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 py-10 text-center text-slate-600">
            <p className="text-sm">Bạn chưa có CV tạo từ mẫu đã hoàn tất.</p>
          </div>
        ) : (
          renderCards(templateItems)
        )}
      </section>
    </div>
  );
}
