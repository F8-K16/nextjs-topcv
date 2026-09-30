"use client";

import { useParams } from "next/navigation";

import BlogPostEditor from "../BlogPostEditor";

export default function AdminBlogEditPage() {
  const params = useParams();
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return <p className="text-sm text-red-700">ID không hợp lệ.</p>;
  }
  return <BlogPostEditor postId={id} />;
}
