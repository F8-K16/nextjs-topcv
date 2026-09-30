import type { Metadata } from "next";
import Link from "next/link";

import { API_BASE_URL } from "@/lib/api-base-url";
import { nextFetchCache } from "@/lib/next-fetch-cache";
import type { PublicBlogPost } from "@/app/types/blog.type";
import { formatDate } from "@/utils/helper";

export const metadata: Metadata = {
  title: "Blog và cẩm nang nghề nghiệp",
  description:
    "Cẩm nang nghề nghiệp, phỏng vấn, CV và phát triển sự nghiệp.",
};

// ISR: Next.js refetch blog từ API sau 1 giờ (Redis backend giữ 24h, invalidate ngay khi admin thay đổi)
export const revalidate = 3600;

async function getPosts(): Promise<PublicBlogPost[]> {
  const base = API_BASE_URL;
  if (!base) return [];
  try {
    const res = await fetch(`${base}/blog-posts?page=1&limit=24`, {
      ...nextFetchCache.blog,
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { posts?: PublicBlogPost[] };
    return Array.isArray(body.posts) ? body.posts : [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-14 md:py-16">
      <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Blog</h1>
      <p className="mt-2 text-xs text-zinc-600 sm:text-sm">
        Cẩm nang nghề nghiệp từ đội ngũ TopCV.
      </p>
      {posts.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-600">Chưa có bài viết công khai.</p>
      ) : (
        <ul className="mt-6 space-y-4 sm:mt-10 sm:space-y-6">
          {posts.map((p) => (
            <li key={p.id}>
              <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
                {p.publishedAt ? (
                  <time className="text-xs text-zinc-500">
                    {formatDate(p.publishedAt)}
                  </time>
                ) : null}
                <h2 className="mt-2 text-base font-semibold text-zinc-900 sm:text-lg">
                  <Link href={`/blog/${p.slug}`} className="hover:text-primary">
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-zinc-600">{p.excerpt}</p>
                <Link
                  href={`/blog/${p.slug}`}
                  className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
                >
                  Đọc tiếp →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/"
        className="mt-12 inline-flex text-sm font-semibold text-primary hover:underline"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
