import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "TopCV — nền tảng tuyển dụng hiện đại, minh bạch và tối ưu trải nghiệm.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-14 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Giới thiệu
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        Về TopCV
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600">
        Chúng tôi kết nối ứng viên và nhà tuyển dụng bằng công nghệ web hiện đại
        (Next.js, bảo mật cookie, cache thông minh) — hướng tới trải nghiệm
        tương đương các nền tảng tuyển dụng hàng đầu.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex text-sm font-semibold text-primary hover:underline"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
