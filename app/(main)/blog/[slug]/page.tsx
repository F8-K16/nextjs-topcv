import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { API_BASE_URL } from "@/lib/api-base-url";
import { nextFetchCache } from "@/lib/next-fetch-cache";
import type { PublicBlogPost } from "@/app/types/blog.type";
import { renderBlogHtml } from "@/lib/blog-content";
import { jsonLdScript, getSiteUrl } from "@/lib/job-posting";
import { formatDate } from "@/utils/helper";
import { BreadcrumbDetailLabel } from "@/contexts/BreadcrumbDetailContext";

// ISR: Next.js refetch bài blog từ API sau 1 giờ
export const revalidate = 3600;

async function getPost(slug: string): Promise<PublicBlogPost | null> {
  const base = API_BASE_URL;
  if (!base || !slug.trim()) return null;
  const res = await fetch(
    `${base}/blog-posts/${encodeURIComponent(slug.trim())}`,
    { ...nextFetchCache.blog },
  );
  if (res.status === 404 || !res.ok) return null;
  const body = (await res.json()) as { post?: PublicBlogPost };
  return body.post ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Bài viết" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const site = getSiteUrl();
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    url: `${site}/blog/${post.slug}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-10 sm:px-4 sm:py-14">
      <BreadcrumbDetailLabel>{post.title}</BreadcrumbDetailLabel>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleLd) }}
      />
      <Link
        href="/blog"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Tất cả bài viết
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 sm:text-3xl">
        {post.title}
      </h1>
      {post.publishedAt ? (
        <p className="mt-2 text-xs text-zinc-500">
          {formatDate(post.publishedAt)}
          {post.author?.username ? ` · ${post.author.username}` : ""}
        </p>
      ) : null}
      <div
        className="mt-6"
        dangerouslySetInnerHTML={{ __html: renderBlogHtml(post.content ?? "") }}
      />
    </div>
  );
}
