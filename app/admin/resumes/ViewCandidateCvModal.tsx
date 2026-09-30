"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CvCanvas from "@/app/(main)/cv/_components/CvCanvas";
import { adminDialogSurface } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import { cvService } from "@/services/cv.service";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ViewCandidateCvModal({
  cvId,
  titleHint,
  candidateLabel,
  onClose,
}: {
  cvId: number;
  titleHint?: string;
  candidateLabel?: string;
  onClose: () => void;
}) {
  const {
    data: cv,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-cv-preview", cvId],
    queryFn: () => cvService.getCvForAdmin(cvId),
    enabled: Number.isFinite(cvId) && cvId > 0,
    staleTime: 60_000,
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("max-h-[92vh] w-full max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-6xl lg:max-w-7xl border", adminDialogSurface)}>
        <DialogHeader className="border-b border-zinc-200 px-6 py-4 text-left dark:border-white/10">
          <DialogTitle className="pr-8 text-base font-semibold text-zinc-900 dark:text-white">
            {titleHint || cv?.title || "Xem CV từ mẫu"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            {candidateLabel ? `Ứng viên: ${candidateLabel}` : null}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-8rem)] overflow-y-auto px-4 pb-6 pt-2">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            </div>
          ) : isError || !cv ? (
            <p className="py-12 text-center text-sm text-red-400">
              Không tải được nội dung CV.
            </p>
          ) : (
            <div className="rounded-xl bg-white p-4 shadow-inner">
              <CvCanvas
                templateData={cv.template.templateData}
                content={cv.content}
                readOnly
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
