"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy, ExternalLink, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import CvCanvas from "@/app/(main)/cv/_components/CvCanvas";
import {
  fetchAdminApplicationPreview,
  type AdminApplicationPreview,
} from "@/services/admin-applications.service";
import { getErrorToastMessage } from "@/lib/submit-error";
import { adminBorderSubtle, adminDialogSurface } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  applicationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function PreviewBody({ data }: { data: AdminApplicationPreview }) {
  const location = [data.candidate.district?.name, data.candidate.province?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          CV ứng viên
        </h3>
        {data.resume.kind === "none" ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center dark:border-white/15 dark:bg-white/5">
            <FileText className="h-10 w-10 text-zinc-500 dark:text-zinc-600" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Chưa có CV đính kèm
            </p>
          </div>
        ) : data.resume.kind === "template" ? (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-inner dark:border-white/10 dark:bg-zinc-800/50">
            <p className="border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
              {data.resume.title}
            </p>
            <div className="max-h-[min(55vh,560px)] overflow-y-auto p-3 custom-scrollbar">
              <CvCanvas
                templateData={data.resume.cv.template.templateData}
                content={data.resume.cv.content}
                readOnly
              />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/90 shadow-inner dark:border-white/10 dark:bg-zinc-800/50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-100 px-3 py-2 dark:border-white/10 dark:bg-zinc-900">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {data.resume.title} · Xem nhanh file
              </p>
              <a
                href={data.resume.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Mở tab mới
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="min-h-[min(50vh,480px)] w-full p-2">
              <iframe
                title="CV ứng viên"
                src={data.resume.fileUrl}
                className="h-[min(55vh,560px)] w-full rounded-lg bg-white"
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Thư ứng tuyển
        </h3>
        {data.coverLetter?.trim() ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800 shadow-inner dark:border-[#2a2a2a] dark:bg-[#252525] dark:text-zinc-200">
            <div className="whitespace-pre-wrap wrap-break-words">
              {data.coverLetter.trim()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center dark:border-white/15 dark:bg-white/5">
            <FileText className="h-10 w-10 text-zinc-500 dark:text-zinc-600" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Không có thư ứng tuyển
            </p>
            <p className="text-xs text-zinc-500">
              Ứng viên không gửi kèm nội dung khi nộp hồ sơ.
            </p>
          </div>
        )}
      </section>

      {location ? (
        <p className="text-xs text-zinc-500">Khu vực: {location}</p>
      ) : null}
    </div>
  );
}

export default function AdminApplicationDetailModal({
  applicationId,
  open,
  onOpenChange,
}: Props) {
  const { data, isPending, isError, error, refetch } =
    useQuery<AdminApplicationPreview>({
      queryKey: ["admin-application-preview", applicationId],
      queryFn: () => fetchAdminApplicationPreview(applicationId!),
      enabled: open && applicationId != null && applicationId > 0,
      staleTime: 60_000,
    });

  const coverForCopy = data?.coverLetter?.trim() ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("flex max-h-[90vh] max-w-[min(100vw-2rem,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl border", adminDialogSurface)}>
        <div className="border-b border-zinc-200 bg-gradient-to-r from-violet-600/10 to-transparent p-4 pr-14 dark:border-white/10 dark:from-violet-600/15">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-zinc-900 dark:text-white">
              Hồ sơ ứng tuyển
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400">
              {data ? (
                <>
                  {data.candidate.user.username} · {data.job.title}
                  <span className="block text-zinc-500">
                    {data.job.company.name}
                  </span>
                </>
              ) : (
                "Đang tải…"
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
              <Loader2 className="h-9 w-9 animate-spin text-violet-600 dark:text-violet-400" />
              <span className="text-sm">Đang tải hồ sơ…</span>
            </div>
          ) : isError || !data ? (
            <div className="py-10 text-center text-sm text-red-400">
              {getErrorToastMessage(error) || "Không tải được hồ sơ."}
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  onClick={() => void refetch()}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          ) : (
            <PreviewBody data={data} />
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center justify-end gap-2 border-t bg-zinc-50 px-4 py-3 dark:bg-zinc-950/50",
            adminBorderSubtle,
            "dark:border-[#2a2a2a]",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!coverForCopy}
            className="border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(coverForCopy);
                toast.success("Đã copy thư ứng tuyển");
              } catch {
                toast.error("Không thể copy");
              }
            }}
          >
            <Copy className="h-4 w-4" />
            Copy thư
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              size="sm"
              className="bg-violet-600 text-white hover:bg-violet-500"
            >
              Đóng
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
