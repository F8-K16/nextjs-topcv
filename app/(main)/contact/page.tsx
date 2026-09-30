import type { Metadata } from "next";
import Link from "next/link";

import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ TopCV — hỗ trợ ứng viên và doanh nghiệp.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-14 md:py-16">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Liên hệ</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Gửi câu hỏi về tài khoản, tin tuyển dụng hoặc hợp tác doanh nghiệp. Email
        sẽ được chuyển tới đội hỗ trợ và bạn nhận thư xác nhận ngay sau khi gửi.
      </p>
      <div className="mt-8 max-w-xl">
        <ContactForm />
      </div>
      <Link
        href="/"
        className="mt-10 inline-flex text-sm font-semibold text-primary hover:underline"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
