"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidatePublicBlog(slug?: string) {
  revalidateTag("api-blog", "max");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  const trimmed = slug?.trim();
  if (trimmed) revalidatePath(`/blog/${trimmed}`);
}
