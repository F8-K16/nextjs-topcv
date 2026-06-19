import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog và cẩm nang nghề nghiệp",
  description:
    "Cẩm nang nghề nghiệp, phỏng vấn, CV và phát triển sự nghiệp.",
};

const posts = [
  {
    id: "cv-chuan-ats",
    title: "Viết CV chuẩn ATS",
    date: "2026-04-01",
  },
  {
    id: "phong-van-star",
    title: "Phỏng vấn theo STAR",
    date: "2026-03-22",
  },
  {
    id: "luong-thoa-thuan",
    title: "Thương lượng lương minh bạch",
    date: "2026-03-10",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-14 md:py-16">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Blog</h1>
      <p className="mt-2 text-xs text-zinc-600 sm:text-sm">
        Tính năng đang trong giai đoạn phát triển
      </p>
      <ul className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
        {posts.map((p) => (
          <li key={p.id} id={p.id}>
            <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <time className="text-xs text-zinc-500">{p.date}</time>
              <h2 className="mt-2 text-base font-semibold text-zinc-900 sm:text-lg">
                {p.title}
              </h2>
              <p className="mt-2 hidden text-sm text-zinc-600 sm:block">
                Bài chi tiết sẽ được bổ sung khi module blog hoàn thiện.
              </p>
            </article>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-12 inline-flex text-sm font-semibold text-primary hover:underline"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
