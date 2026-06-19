"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Image from "next/image";

import { useModalStore } from "@/app/stores/modal.store";
import { formatDate } from "@/utils/helper";

export default function CvDraftModal() {
  const router = useRouter();
  const { isOpen, type, data, closeModal } = useModalStore();

  const cvId = Number(data?.cvId);
  const title = String(data?.cvTitle ?? "").trim();
  const thumbnailUrl = (data?.cvThumbnailUrl as string | null | undefined) ?? null;
  const lastEditedAt = (data?.cvLastEditedAt as string | undefined) ?? undefined;

  const canRender = useMemo(() => {
    if (!isOpen || type !== "cv-draft") return false;
    if (!Number.isFinite(cvId) || cvId <= 0) return false;
    return true;
  }, [isOpen, type, cvId]);

  if (!canRender) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-5 pt-10 md:justify-end md:px-8"
      aria-live="polite"
    >
      <div
        role="region"
        aria-label="Nhắc CV nháp"
        className="pointer-events-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5"
      >
        <div className="flex items-start justify-between gap-6 px-5 pb-4 pt-5">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-slate-900">Bạn có CV chưa lưu</p>
            <p className="mt-1 text-sm text-slate-600">
              Hoàn tất để không mất dữ liệu
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-center gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4">
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200/70">
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={title || `cv-draft-${cvId}`}
                  width={48}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-slate-50 to-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                {title || "CV nháp"}
              </p>
              {lastEditedAt ? (
                <p className="mt-1 text-xs text-slate-600">
                  Chỉnh sửa lần cuối: {formatDate(lastEditedAt)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Để sau
            </button>
            <button
              type="button"
              onClick={() => {
                closeModal();
                router.push(`/cv/editor/${cvId}`);
              }}
              className="rounded-full bg-[#00b14f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#009944]"
            >
              Tiếp tục chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

