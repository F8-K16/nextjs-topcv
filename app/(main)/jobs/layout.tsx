import { Suspense } from "react";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-zinc-500">
          Đang tải trang việc làm…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
