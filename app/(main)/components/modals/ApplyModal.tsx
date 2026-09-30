"use client";

import type { Resume } from "@/app/types/resume.type";
import { useModalStore } from "@/app/stores/modal.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/services/resume.service";
import { cvService } from "@/services/cv.service";
import { applicationService } from "@/services/application.service";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  FileText,
  X,
  Upload,
  CheckCircle2,
  Briefcase,
  Sparkles,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getErrorToastMessage } from "@/lib/submit-error";
import { STALE_MY_RESUMES_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import type { CvListItem } from "@/app/types/cv.type";
import axiosClient from "@/lib/axios";
import type { Job } from "@/app/types/job.type";
import { aiService } from "@/services/ai.service";
import { usePublicFeatures } from "@/hooks/usePublicFeatures";
import { parseSharedCvIdFromResumeFileUrl } from "@/lib/cv-resume-url";

type ApplyResumeOption = {
  id: number;
  title: string;
  source: "upload" | "template";
};

function ApplyModalBody({
  jobId,
  closeModal,
}: {
  jobId: number;
  closeModal: () => void;
}) {
  const queryClient = useQueryClient();
  const { ai } = usePublicFeatures();
  const userId = useAuthStore((s) => s.user?.id);
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    source: "upload" | "template";
  } | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submittedApplicationId, setSubmittedApplicationId] = useState<
    number | null
  >(null);
  const [aiMatchStatus, setAiMatchStatus] = useState<
    "PENDING" | "RUNNING" | "DONE" | "FAILED"
  >("PENDING");
  const [aiMatchScore, setAiMatchScore] = useState<number | null>(null);
  const [aiMatchError, setAiMatchError] = useState<string | null>(null);

  const { data: resumes = [], isLoading: isResumesLoading } = useQuery<
    Resume[]
  >({
    queryKey: ["my-resumes", userId],
    queryFn: async () => {
      const raw = await resumeService.getMyResumes();
      return Array.isArray(raw) ? raw : [];
    },
    enabled: !!userId,
    staleTime: STALE_MY_RESUMES_MS,
  });

  const { data: cvs = [], isLoading: isCvsLoading } = useQuery<CvListItem[]>({
    queryKey: ["my-cvs", userId],
    queryFn: async () => {
      const raw = await cvService.listMyCvs();
      return Array.isArray(raw) ? raw : [];
    },
    enabled: !!userId,
    staleTime: STALE_MY_RESUMES_MS,
  });

  const { data: jobDetail } = useQuery<Job | null>({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      try {
        const res = await axiosClient.get(`/jobs/${jobId}`, {
          headers: { Accept: "application/json" },
        });
        return res.data as Job;
      } catch {
        return null;
      }
    },
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
  });

  const coverLetterMutation = useMutation({
    mutationFn: async () => {
      if (!jobDetail) {
        throw new Error("Không tải được thông tin công việc");
      }
      const skills = (jobDetail.jobSkills ?? [])
        .map((x) => x.skill?.name)
        .filter(Boolean) as string[];

      const { text } = await aiService.applyCoverLetter({
        language: "vi",
        tone: "professional",
        length: "medium",
        jobTitle: jobDetail.title,
        companyName: jobDetail.company?.name,
        jobDescription: jobDetail.description,
        skills: skills.slice(0, 20),
      });
      return text;
    },
    onSuccess: (text) => {
      setCoverLetter(text);
      toast.success("Đã tạo thư ứng tuyển");
    },
    onError: (err: unknown) => {
      toast.error(getErrorToastMessage(err) || "Không thể tạo thư ứng tuyển");
    },
  });

  const options: ApplyResumeOption[] = useMemo(() => {
    const uploads = resumes
      .filter((r) => parseSharedCvIdFromResumeFileUrl(r.fileUrl) == null)
      .map((resume) => ({
        id: resume.id,
        title: resume.title,
        source: "upload" as const,
      }));
    const templates = cvs
      .filter((cv) => cv.status === "COMPLETED")
      .map((cv) => ({
        id: cv.id,
        title: cv.title,
        source: "template" as const,
      }));
    return [...uploads, ...templates];
  }, [resumes, cvs]);

  const isLoading = isResumesLoading || isCvsLoading;
  const effectiveSelection = selectedOption ?? options[0] ?? null;

  const resolveEffectiveResumeId = async (): Promise<number> => {
    if (!effectiveSelection) {
      throw new Error("Thiếu thông tin CV");
    }
    if (effectiveSelection.source === "template") {
      const published = await cvService.publishCvAsResume(
        effectiveSelection.id,
      );
      return published.id;
    }
    return effectiveSelection.id;
  };

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveSelection) {
        throw new Error("Thiếu thông tin tin hoặc CV");
      }

      const effectiveResumeId = await resolveEffectiveResumeId();

      return applicationService.applyJob({
        jobId,
        resumeId: effectiveResumeId,
        coverLetter: coverLetter.trim() ? coverLetter.trim() : undefined,
      });
    },
    onSuccess: () => {
      toast.success("Đã gửi đơn ứng tuyển thành công");
      void queryClient.invalidateQueries({ queryKey: ["my-resumes"] });
      void queryClient.invalidateQueries({ queryKey: ["my-cvs"] });
      void queryClient.invalidateQueries({ queryKey: ["applied-job-ids"] });
      void queryClient.invalidateQueries({
        queryKey: ["notifications-unread"],
      });
    },
    onError: (err: unknown) => {
      toast.error(getErrorToastMessage(err) || "Ứng tuyển thất bại");
    },
  });

  useEffect(() => {
    if (submittedApplicationId == null) return;
    let cancelled = false;
    let tries = 0;

    const tick = async () => {
      tries += 1;
      try {
        const app = await applicationService.getMyApplication(
          submittedApplicationId,
        );
        if (cancelled || !app) return;
        const st = app.aiMatchStatus ?? "PENDING";
        setAiMatchStatus(st);
        setAiMatchScore(
          typeof app.aiMatchScore === "number" ? app.aiMatchScore : null,
        );
        setAiMatchError(
          typeof app.aiMatchError === "string" ? app.aiMatchError : null,
        );
        if (st === "DONE" || st === "FAILED") return;
      } catch (e) {
        if (!cancelled && tries >= 3) {
          setAiMatchError(
            getErrorToastMessage(e) || "Không thể lấy trạng thái chấm điểm",
          );
        }
      }
      if (!cancelled && tries < 30) {
        setTimeout(() => void tick(), 2000);
      }
    };

    void tick();
    return () => {
      cancelled = true;
    };
  }, [submittedApplicationId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-300/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="shrink-0 border-b border-gray-100 bg-linear-to-r from-[#00b14f]/10 to-transparent px-6 pb-4 pt-6 pr-14">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#00b14f]/15 px-2.5 py-0.5 text-xs font-semibold text-[#00b14f]">
            <Briefcase className="h-3.5 w-3.5" />
            Ứng tuyển
          </div>
          <h2
            id="apply-modal-title"
            className="text-xl font-bold text-gray-900"
          >
            Chọn CV gửi nhà tuyển dụng
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Nhà tuyển dụng sẽ nhận được file CV bạn chọn bên dưới.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {submittedApplicationId != null ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">
                      Đã nhận hồ sơ
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {ai
                        ? "Đang chấm điểm match giữa CV và JD. Bạn có thể đóng, hệ thống sẽ chạy nền."
                        : "Nhà tuyển dụng đã nhận hồ sơ của bạn."}
                    </div>
                  </div>
                  {ai && aiMatchStatus === "DONE" ? (
                    <span className="rounded-full bg-[#00b14f]/10 px-2.5 py-1 text-xs font-semibold text-[#00b14f]">
                      AI Match {aiMatchScore ?? 0}%
                    </span>
                  ) : ai ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang xử lý
                    </span>
                  ) : null}
                </div>

                {ai ? <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                    <span className="text-gray-700">1) Lưu hồ sơ</span>
                    <span className="text-xs font-semibold text-emerald-700">
                      Xong
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                    <span className="text-gray-700">
                      2) Trích xuất nội dung CV
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {aiMatchStatus === "PENDING"
                        ? "Chờ"
                        : aiMatchStatus === "RUNNING"
                          ? "Đang chạy"
                          : aiMatchStatus === "DONE"
                            ? "Xong"
                            : "Lỗi"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                    <span className="text-gray-700">
                      3) Chấm điểm AI theo JD
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {aiMatchStatus === "PENDING"
                        ? "Chờ"
                        : aiMatchStatus === "RUNNING"
                          ? "Đang chạy"
                          : aiMatchStatus === "DONE"
                            ? "Xong"
                            : "Lỗi"}
                    </span>
                  </div>
                </div> : null}

                {ai && aiMatchStatus === "FAILED" ? (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {aiMatchError ||
                      "Không chấm được điểm AI, vui lòng thử lại sau."}
                  </div>
                ) : null}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
              <span className="text-sm">Đang tải danh sách CV...</span>
            </div>
          ) : options.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-5 py-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">
                Bạn chưa có CV nào trong hệ thống
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Tải CV PDF hoặc tạo CV từ mẫu để có thể ứng tuyển.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link
                  href="/resumes/upload"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#009944]"
                >
                  <Upload className="h-4 w-4" />
                  Tải CV
                </Link>
                <Link
                  href="/cv/templates"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Tạo CV
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <ul className="space-y-2">
                {options.map((option) => {
                  const selected =
                    effectiveSelection?.id === option.id &&
                    effectiveSelection?.source === option.source;
                  return (
                    <li key={`${option.source}-${option.id}`}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedOption({
                            id: option.id,
                            source: option.source,
                          })
                        }
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? "border-[#00b14f] bg-[#00b14f]/5 ring-1 ring-[#00b14f]/30"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/80"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            selected ? "bg-[#00b14f] text-white" : "bg-gray-100"
                          }`}
                        >
                          {selected ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900">
                            {option.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {option.source === "upload"
                              ? `CV tải lên #${option.id}`
                              : `CV từ mẫu #${option.id}`}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Thư ứng tuyển
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Nội dung này sẽ được gửi kèm hồ sơ ứng tuyển để nhà tuyển
                      dụng xem.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {ai ? (
                    <button
                      type="button"
                      onClick={() => coverLetterMutation.mutate()}
                      disabled={coverLetterMutation.isPending || !jobId}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#00b14f]/25 bg-[#00b14f]/5 px-3 py-2 text-xs font-semibold text-[#00b14f] transition hover:bg-[#00b14f]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {coverLetterMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          AI gợi ý
                        </>
                      )}
                    </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(coverLetter);
                          toast.success("Đã copy thư ứng tuyển");
                        } catch {
                          toast.error("Không thể copy");
                        }
                      }}
                      disabled={!coverLetter}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </div>

                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={
                    ai
                      ? "Nhấn “AI gợi ý” để tạo thư ứng tuyển..."
                      : "Nhập thư ứng tuyển (không bắt buộc)..."
                  }
                  className="mt-3 min-h-[220px] w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 outline-none focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f]/15 sm:min-h-[260px]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200/80"
          >
            Đóng
          </button>
          {submittedApplicationId == null ? (
            <button
              type="button"
              disabled={
                !effectiveSelection ||
                applyMutation.isPending ||
                !jobId ||
                !options.length
              }
              onClick={async () => {
                const res = await applyMutation.mutateAsync();
                const id = res?.data?.id;
                if (typeof id === "number") {
                  setSubmittedApplicationId(id);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#009944] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đơn ứng tuyển"
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ApplyModal() {
  const { isOpen, type, data, closeModal } = useModalStore();
  const jobId = data?.jobId as number | undefined;

  if (!isOpen || type !== "apply" || jobId == null) return null;

  return <ApplyModalBody jobId={jobId} closeModal={closeModal} />;
}
