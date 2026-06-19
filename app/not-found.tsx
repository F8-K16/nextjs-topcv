import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-linear-to-b from-zinc-50 to-white px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#00b14f]/10 text-[#00b14f]">
          <FileQuestion className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#00b14f]">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 md:text-3xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Đường dẫn không tồn tại hoặc nội dung đã được gỡ. Bạn có thể về trang
          chủ hoặc tìm việc làm.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#009944]"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
          >
            <Search className="h-4 w-4" />
            Tìm việc làm
          </Link>
        </div>
      </div>
    </div>
  );
}
