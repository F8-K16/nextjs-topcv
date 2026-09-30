"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { adminBlogService } from "@/services/admin-blog.service";
import { ADMIN_ADD_NEW_BUTTON, ADMIN_PAGE_STACK, adminInput, adminLabel } from "@/lib/admin-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getErrorToastMessage } from "@/lib/submit-error";
import { STALE_ADMIN_BLOG_MS } from "@/lib/query-stale-time";

export default function BlogPostEditor({ postId }: { postId?: number }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [hydrated, setHydrated] = useState(!postId);

  const detail = useQuery({
    queryKey: ["admin", "blog", "detail", postId],
    queryFn: () => adminBlogService.get(postId!),
    enabled: Boolean(postId),
    staleTime: STALE_ADMIN_BLOG_MS,
  });

  useEffect(() => {
    if (!detail.data) return;
    setTitle(detail.data.title);
    setSlug(detail.data.slug);
    setExcerpt(detail.data.excerpt);
    setContent(detail.data.content ?? "");
    setCoverUrl(detail.data.coverUrl ?? "");
    setPublished(Boolean(detail.data.publishedAt));
    setHydrated(true);
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverUrl: coverUrl.trim(),
        slug: slug.trim(),
        published,
      };
      return postId
        ? adminBlogService.update(postId, payload)
        : adminBlogService.create(payload);
    },
    onSuccess: () => {
      toast.success(postId ? "Đã cập nhật bài viết" : "Đã tạo bài viết");
      router.push("/admin/blog");
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không lưu được bài viết"),
  });

  if (postId && (detail.isLoading || !hydrated)) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
    );
  }

  if (postId && detail.isError) {
    return <p className="text-sm text-red-700">Không tải được bài viết.</p>;
  }

  return (
    <div className={ADMIN_PAGE_STACK}>
      <AdminPageHeader
        title={postId ? "Sửa bài viết" : "Bài viết mới"}
        description="Đoạn ## thành tiêu đề, **in đậm**. Xuất bản để hiện trên /blog."
      />
      <form
        className="max-w-3xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <label className={adminLabel} htmlFor="blog-title">
            Tiêu đề
          </label>
          <input
            id="blog-title"
            className={adminInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="blog-slug">
            Slug (để trống sẽ tạo từ tiêu đề)
          </label>
          <input
            id="blog-slug"
            className={adminInput}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="blog-excerpt">
            Tóm tắt
          </label>
          <textarea
            id="blog-excerpt"
            rows={3}
            className={adminInput}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="blog-content">
            Nội dung
          </label>
          <textarea
            id="blog-content"
            rows={16}
            className={adminInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="blog-cover">
            Ảnh bìa (URL https, tùy chọn)
          </label>
          <input
            id="blog-cover"
            className={adminInput}
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Xuất bản công khai
        </label>
        <button
          type="submit"
          disabled={save.isPending}
          className={ADMIN_ADD_NEW_BUTTON}
        >
          {save.isPending ? "Đang lưu..." : "Lưu bài viết"}
        </button>
      </form>
    </div>
  );
}
