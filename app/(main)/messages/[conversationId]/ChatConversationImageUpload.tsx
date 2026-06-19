"use client";

import type { RefObject } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type Props = {
  disabled?: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  onOpenPicker: () => void;
};

export default function ChatConversationImageUpload({
  disabled,
  fileInputRef,
  previewUrl,
  onFileSelected,
  onClear,
  onOpenPicker,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (!f.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh (JPG, PNG, WebP, GIF).");
            return;
          }
          if (f.size > 8 * 1024 * 1024) {
            toast.error("Ảnh tối đa 8MB.");
            return;
          }
          onFileSelected(f);
        }}
      />

      {!previewUrl ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={onOpenPicker}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:border-primary hover:bg-emerald-50 hover:text-primary disabled:opacity-50"
            title="Đính kèm ảnh"
            aria-label="Đính kèm ảnh"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <span className="text-xs text-zinc-500">Gửi ảnh - kèm chú thích</span>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/90 p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative flex justify-center sm:justify-start">
              <Image
                src={previewUrl}
                alt="Xem trước"
                width={200}
                height={200}
                className="max-h-52 max-w-full rounded-lg border border-zinc-200 bg-white object-contain"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-xs leading-relaxed text-zinc-600">
                Nhập chú thích ở ô bên dưới (tuỳ chọn), rồi bấm{" "}
                <span className="font-semibold text-zinc-800">Gửi</span>.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onClear}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Gỡ ảnh
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onOpenPicker}
                  className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
                >
                  Chọn ảnh khác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
