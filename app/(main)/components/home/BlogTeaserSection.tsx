import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

const posts = [
  {
    slug: "cv-chuan-ats",
    title: "Viết CV chuẩn ATS để vượt cổng lọc tự động",
    excerpt: "Từ khóa, cấu trúc, độ dài — checklist ngắn gọn cho ứng viên IT.",
  },
  {
    slug: "phong-van-star",
    title: "Phỏng vấn theo mô hình STAR",
    excerpt: "Cách kể chuyện có số liệu, gây ấn tượng với hiring manager.",
  },
  {
    slug: "luong-thoa-thuan",
    title: "Thương lượng lương minh bạch",
    excerpt: "Nghiên cứu thị trường và khung lương trước khi nhận offer.",
  },
];

export default function BlogTeaserSection() {
  return (
    <section className="py-10 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Cẩm nang nghề nghiệp
          </p>
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:flex-nowrap">
            <h2 className="min-w-0 flex-1 text-xl font-bold text-zinc-900 sm:text-2xl md:text-3xl">
              Blog & Career tips
            </h2>
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Xem blog
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          {posts.map((p, index) => (
            <Link
              key={p.slug}
              href={`/blog#${p.slug}`}
              className={cn(
                "group flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md sm:p-6",
                index > 0 && "hidden sm:flex",
              )}
            >
              <h3 className="font-semibold text-zinc-900 group-hover:text-primary">
                {p.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-zinc-600">{p.excerpt}</p>
              <span className="mt-4 text-xs font-semibold text-primary">
                Đọc tiếp →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
