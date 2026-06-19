import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ TopCV — hỗ trợ ứng viên và doanh nghiệp.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-14 md:py-16">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Liên hệ</h1>
      <p className="mt-4 hidden text-sm text-zinc-600 sm:block">
        Form liên hệ và ticketing có thể tích hợp ở bước tiếp theo (email /
        CRM).
      </p>
      <p className="mt-6 text-sm text-zinc-700">
        Email hỗ trợ:{" "}
        <a
          href="mailto:support@topcv.local"
          className="font-medium text-primary hover:underline"
        >
          support@topcv.local
        </a>
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
