import type { Metadata } from "next";

import BlogPostEditor from "../BlogPostEditor";

export const metadata: Metadata = {
  title: "Bài viết mới",
};

export default function AdminBlogNewPage() {
  return <BlogPostEditor />;
}
