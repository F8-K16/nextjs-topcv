"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { cvService } from "@/services/cv.service";
import {
  GC_DEFAULT_MS,
  STALE_CV_TEMPLATE_DETAIL_MS,
  STALE_MY_CVS_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { buildDefaultContent } from "@/lib/cv-content";
import { useCvDraftPrompt } from "@/hooks/useCvDraftPrompt";
import type { CvListItem } from "@/app/types/cv.type";
import CvCanvas from "../../_components/CvCanvas";

type Props = { templateId: number };

export default function CvTemplatePreviewClient({ templateId }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadingAuth = useAuthStore((s) => s.loadingAuth);
  const isAuthed = Boolean(user?.id);
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));

  const { data: template, isLoading, isError } = useQuery({
    queryKey: ["cv-template", templateId],
    queryFn: () => cvService.getTemplate(templateId),
    staleTime: STALE_CV_TEMPLATE_DETAIL_MS,
    gcTime: GC_DEFAULT_MS,
    enabled: Number.isFinite(templateId),
  });

  const previewContent = useMemo(() => {
    if (!template) return {};
    return buildDefaultContent(template.templateData);
  }, [template]);

  const { data: myCvs = [], isLoading: isCvsLoading } = useQuery<CvListItem[]>({
    queryKey: ["my-cvs", user?.id],
    queryFn: async () => {
      try {
        return await cvService.listMyCvs();
      } catch {
        return [];
      }
    },
    staleTime: STALE_MY_CVS_MS,
    gcTime: GC_DEFAULT_MS,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: isAuthed && isCandidate && !loadingAuth,
  });

  useCvDraftPrompt({
    cvs: myCvs,
    enabled:
      isAuthed && isCandidate && !loadingAuth && !isCvsLoading && Boolean(template),
  });

  const createMutation = useMutation({
    mutationFn: () => cvService.createCv({ templateId }),
    onSuccess: (cv) => {
      toast.success("Đã tạo CV nháp");
      router.push(`/cv/editor/${cv.id}`);
    },
    onError: () => {
      toast.error("Không tạo được CV. Vui lòng thử lại.");
    },
  });

  const handleUseTemplate = () => {
    if (!isAuthed) {
      toast.info("Vui lòng đăng nhập để sử dụng mẫu CV");
      router.push(`/auth/login?next=/cv/templates/${templateId}`);
      return;
    }
    createMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-12 text-center text-sm text-red-700">
        Không tải được mẫu CV.{" "}
        <Link href="/cv/templates" className="font-semibold underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href="/cv/templates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#00b14f]"
        >
          <ArrowLeft className="h-4 w-4" /> Tất cả mẫu CV
        </Link>
        <div className="flex w-full sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={handleUseTemplate}
            disabled={createMutation.isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#009944] disabled:opacity-60 sm:w-auto"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            Dùng mẫu này
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50 sm:p-5 md:p-6">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">
              {template.name}
            </h1>
            {template.description ? (
              <p className="mt-1 line-clamp-3 text-sm text-slate-600 md:line-clamp-none">
                {template.description}
              </p>
            ) : null}
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              Inline edit
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Autosave
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
              Miễn phí
            </span>
          </div>
        </div>

        <div className="bg-slate-50/80 px-1 py-4 sm:px-4 sm:py-6 md:px-10 md:py-10">
          <CvCanvas
            templateData={template.templateData}
            content={previewContent}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
