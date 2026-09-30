"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import CvCanvas from "@/app/(main)/cv/_components/CvCanvas";
import {
  employerPortalService,
  type EmployerApplicationPreview,
} from "@/services/employer-portal.service";
import { getErrorToastMessage } from "@/lib/submit-error";
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

function PreviewBody({ data }: { data: EmployerApplicationPreview }) {
  const location = [data.candidate.district?.name, data.candidate.province?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <FileText className="h-4 w-4 text-primary" />
          CV ứng viên
        </h3>
        {data.resume.kind === "none" ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <FileText className="h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-700">
              Chưa có CV đính kèm
            </p>
          </div>
        ) : data.resume.kind === "template" ? (
          <div className="keep-light overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
              {data.resume.title}
            </p>
            <div className="max-h-[min(55vh,560px)] overflow-y-auto p-3">
              <CvCanvas
                templateData={data.resume.cv.template.templateData}
                content={data.resume.cv.content}
                readOnly
              />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-sm">
            <p className="border-b border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600">
              {data.resume.title} · Xem nhanh file
            </p>
            <div className="min-h-[min(50vh,480px)] w-full p-2">
              <iframe
                title="CV ứng viên"
                src={data.resume.fileUrl}
                className="keep-light h-[min(55vh,560px)] w-full rounded-lg bg-white"
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Thư ứng tuyển
        </h3>
        {data.coverLetter?.trim() ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-800 shadow-xs">
            <div className="whitespace-pre-wrap wrap-break-words">
              {data.coverLetter.trim()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <FileText className="h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-700">
              Không có thư ứng tuyển
            </p>
            <p className="text-xs text-zinc-500">
              Ứng viên không gửi kèm nội dung khi nộp hồ sơ.
            </p>
          </div>
        )}
      </section>

      {location ? (
        <p className="text-xs text-zinc-500">
          Khu vực: {location}
        </p>
      ) : null}
    </div>
  );
}

export function EmployerApplicationPreviewPane({
  applicationId,
}: {
  applicationId: number | null;
}) {
  const { data, isPending, isError, error, refetch } =
    useQuery<EmployerApplicationPreview>({
      queryKey: ["employer-application-preview", applicationId],
      queryFn: () =>
        employerPortalService.getApplicationPreview(applicationId!),
      enabled: applicationId != null && applicationId > 0,
      staleTime: 60_000,
    });

  const coverForCopy = data?.coverLetter?.trim() ?? "";

  if (applicationId == null) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center px-6 text-center text-sm text-zinc-500">
        Chọn một hồ sơ bên trái để xem CV và thư ứng tuyển.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">
          {data
            ? data.candidate.user.username
            : "Hồ sơ ứng tuyển"}
        </p>
        <p className="text-xs text-zinc-500">
          {data ? data.job.title : "Đang tải…"}
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
            <Loader2 className="h-9 w-9 animate-spin text-primary" />
            <span className="text-sm">Đang tải hồ sơ…</span>
          </div>
        ) : isError || !data ? (
          <div className="py-10 text-center text-sm text-red-600">
            {getErrorToastMessage(error) || "Không tải được hồ sơ."}
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
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
      <div className="flex justify-end border-t border-zinc-100 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!coverForCopy}
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
      </div>
    </div>
  );
}

export default function EmployerApplicationDetailModal({
  applicationId,
  open,
  onOpenChange,
}: Props) {
  const { data, isPending, isError, error, refetch } =
    useQuery<EmployerApplicationPreview>({
      queryKey: ["employer-application-preview", applicationId],
      queryFn: () =>
        employerPortalService.getApplicationPreview(applicationId!),
      enabled: open && applicationId != null && applicationId > 0,
      staleTime: 60_000,
    });

  const coverForCopy = data?.coverLetter?.trim() ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="employer-app flex max-h-[90vh] max-w-[min(100vw-2rem,56rem)] flex-col gap-0 overflow-hidden border-zinc-200 bg-white p-0 sm:max-w-3xl dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50">
        <div className="border-b border-zinc-200 bg-linear-to-r from-primary/10 to-transparent p-4 pr-14">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle>Hồ sơ ứng tuyển</DialogTitle>
            <DialogDescription className="text-xs text-zinc-600">
              {data
                ? `${data.candidate.user.username} · ${data.job.title}`
                : "Đang tải…"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <span className="text-sm">Đang tải hồ sơ…</span>
            </div>
          ) : isError || !data ? (
            <div className="py-10 text-center text-sm text-red-600">
              {getErrorToastMessage(error) || "Không tải được hồ sơ."}
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50/80 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!coverForCopy}
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
            <Button type="button" size="sm">
              Đóng
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
