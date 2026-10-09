"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { revalidatePublicBlog } from "@/app/actions/blog.action";
import { adminBlogService } from "@/services/admin-blog.service";
import { ADMIN_ADD_NEW_BUTTON, ADMIN_PAGE_STACK, adminInput, adminLabel } from "@/lib/admin-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  BlogRichTextEditor,
  type BlogRichTextEditorHandle,
} from "@/components/admin/BlogRichTextEditor";
import UploadButton from "@/components/UploadButton";
import {
  editorHtmlFromStored,
  htmlToPlainText,
} from "@/lib/blog-content";
import { getErrorToastMessage } from "@/lib/submit-error";
import { STALE_ADMIN_BLOG_MS } from "@/lib/query-stale-time";

export default function BlogPostEditor({ postId }: { postId?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editorRef = useRef<BlogRichTextEditorHandle>(null);
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
    setContent(editorHtmlFromStored(detail.data.content ?? ""));
    setCoverUrl(detail.data.coverUrl ?? "");
    setPublished(Boolean(detail.data.publishedAt));
    setHydrated(true);
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () => {
      const body = (editorRef.current?.getHtml() ?? content).trim();
      if (htmlToPlainText(body).length < 20) {
        throw new Error("Nội dung bài viết cần ít nhất 20 ký tự");
      }
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: body,
        coverUrl: coverUrl.trim(),
        slug: slug.trim(),
        published,
      };
      return postId
        ? adminBlogService.update(postId, payload)
        : adminBlogService.create(payload);
    },
    onSuccess: async (post) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      try {
        await revalidatePublicBlog(post.slug);
      } catch {
        // Trang công khai có thể còn cache ngắn; nội dung admin đã lưu.
      }
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
        description="Soạn thảo định dạng đầy đủ: tiêu đề, in đậm, danh sách, liên kết và ảnh. Xuất bản để hiện trên /blog."
      />
      <form
        className="max-w-4xl space-y-4"
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
          <BlogRichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="blog-cover">
            Ảnh bìa (tùy chọn)
          </label>
          <div className="mt-1 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 dark:border-white/15 dark:bg-white/5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-black/30">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt="Ảnh bìa bài viết"
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <UploadButton
                    signatureEndpoint="/api/sign-cloudinary-params"
                    className="cursor-pointer rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
                    uploadPreset="F8_TopCV"
                    options={{ tags: ["blog-cover"] }}
                    onSuccess={(results: CloudinaryUploadWidgetResults) => {
                      const info = results?.info;
                      const url =
                        typeof info === "object" && info !== null
                          ? info.secure_url
                          : undefined;
                      if (url) setCoverUrl(url);
                    }}
                  >
                    Tải ảnh lên
                  </UploadButton>
                  {coverUrl ? (
                    <button
                      type="button"
                      onClick={() => setCoverUrl("")}
                      className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
                    >
                      Xóa ảnh
                    </button>
                  ) : null}
                </div>
                <input
                  id="blog-cover"
                  className={adminInput}
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Hoặc dán URL https"
                />
              </div>
            </div>
          </div>
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
