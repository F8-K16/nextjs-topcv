import type { Metadata } from "next";
import Link from "next/link";
import { Construction, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Coming soon",
  description:
    "Tính năng TopCV đang được phát triển — sẽ sớm có trên nền tảng.",
};

type Props = {
  searchParams: Promise<{ ten?: string; feature?: string; name?: string }>;
};

export default async function ComingSoonPage({ searchParams }: Props) {
  const params = await searchParams;
  const rawName = params.ten ?? params.feature ?? params.name;
  const featureName =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim()
      : null;

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00b14f]/12 text-[#00b14f] ring-1 ring-[#00b14f]/20">
          <Construction className="h-8 w-8" strokeWidth={1.75} aria-hidden />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-[#00b14f]">
          TopCV
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {featureName ? (
            <>
              <span className="block text-zinc-600">&ldquo;{featureName}&rdquo;</span>
              <span className="mt-2 block">đang được phát triển</span>
            </>
          ) : (
            "Tính năng đang được phát triển"
          )}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          Chúng tôi đang hoàn thiện trải nghiệm này để phục vụ bạn tốt hơn. Vui
          lòng quay lại sau hoặc khám phá các mục khác trên nền tảng.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00b14f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#009946]"
          >
            <Home className="h-4 w-4" aria-hidden />
            Về trang chủ
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Việc làm
          </Link>
        </div>
      </div>
    </div>
  );
}
