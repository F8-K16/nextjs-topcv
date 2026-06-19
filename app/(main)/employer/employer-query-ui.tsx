"use client";

export function readEmployerQueryError(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

export function EmployerQueryError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const raw = readEmployerQueryError(error);
  return (
    <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-900">
      <p>{raw || "Không tải được dữ liệu."}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-50"
      >
        {"Thử lại"}
      </button>
    </div>
  );
}

export function EmployerQueryLoading({
  label = "Đang tải…",
}: {
  label?: string;
}) {
  return (
    <div className="py-12 text-center text-sm text-zinc-500">{label}</div>
  );
}
