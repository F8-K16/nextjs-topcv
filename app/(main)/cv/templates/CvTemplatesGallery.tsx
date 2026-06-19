"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";

import { cvService } from "@/services/cv.service";
import {
  GC_DEFAULT_MS,
  STALE_CV_TEMPLATES_MS,
  STALE_MY_CVS_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { useCvDraftPrompt } from "@/hooks/useCvDraftPrompt";
import { CvListItem } from "@/app/types/cv.type";

const TEMPLATE_TAGS = ["Phổ biến", "Đơn giản", "Chuyên nghiệp"];

export default function CvTemplatesGallery() {
  const user = useAuthStore((s) => s.user);
  const loadingAuth = useAuthStore((s) => s.loadingAuth);
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));

  const {
    data: templates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cv-templates"],
    queryFn: () => cvService.listTemplates(),
    staleTime: STALE_CV_TEMPLATES_MS,
    gcTime: GC_DEFAULT_MS,
  });

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
    enabled: !!user?.id && isCandidate && !loadingAuth,
  });

  useCvDraftPrompt({
    cvs: myCvs,
    enabled: !!user?.id && isCandidate && !loadingAuth && !isCvsLoading,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-12 text-center text-sm text-red-700">
        Không tải được danh sách mẫu CV. Vui lòng thử lại.
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/80 py-16 text-center text-slate-600">
        Hiện chưa có mẫu CV nào. Vui lòng quay lại sau.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {templates.map((tpl, idx) => {
        const tag = TEMPLATE_TAGS[idx % TEMPLATE_TAGS.length];
        return (
          <Link
            key={tpl.id}
            href={`/cv/templates/${tpl.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-200/30 transition hover:-translate-y-0.5 hover:border-[#00b14f]/30 hover:shadow-md"
          >
            <div className="relative aspect-5/4 overflow-hidden bg-linear-to-br from-[#e8f6ec] via-white to-slate-50">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00b14f]/[0.07]"
                aria-hidden
              />
              {tpl.thumbnailUrl ? (
                <Image
                  src={tpl.thumbnailUrl}
                  alt={tpl.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl bg-white/95 p-6 shadow-sm ring-1 ring-slate-200/60 transition group-hover:scale-[1.02]">
                    <FileText
                      className="h-12 w-12 text-[#00b14f]"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                {tpl.name}
              </h3>
              {tpl.description ? (
                <p className="line-clamp-2 text-sm text-slate-500">
                  {tpl.description}
                </p>
              ) : null}
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Miễn phí</span>
                  <span className="inline-flex items-center rounded-full border border-[#00b14f]/15 bg-[#00b14f]/10 px-2 py-0.5 text-[11px] font-medium text-[#00b14f]">
                    {tag}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#00b14f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition group-hover:bg-[#009944]">
                  Xem mẫu
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
