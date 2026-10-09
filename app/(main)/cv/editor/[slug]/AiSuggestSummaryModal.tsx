"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  loading?: boolean;
  suggestions: string[];
  onClose: () => void;
  onSelect: (text: string) => void;
};

export default function AiSuggestSummaryModal({
  open,
  loading = false,
  suggestions,
  onClose,
  onSelect,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              AI gợi ý phần Giới thiệu
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Chọn 1 gợi ý để chèn vào CV
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-600">
              Đang tạo gợi ý…
            </div>
          ) : suggestions.length ? (
            <div className="space-y-3">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {s}
                  </p>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelect(s)}
                      className="inline-flex h-9 items-center rounded-lg bg-[#00b14f] px-4 text-sm font-semibold text-white hover:bg-[#009944]"
                    >
                      Dùng gợi ý này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-600">
              Chưa có gợi ý.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
