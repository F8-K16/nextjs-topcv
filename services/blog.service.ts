import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { BlogListResponse, PublicBlogPost } from "@/app/types/blog.type";

export const blogService = {
  async list(params?: { page?: number; limit?: number }): Promise<BlogListResponse> {
    try {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.limit) search.set("limit", String(params.limit));
      const qs = search.toString();
      const { data } = await axiosClient.get<BlogListResponse>(
        `/blog-posts${qs ? `?${qs}` : ""}`,
      );
      return {
        posts: Array.isArray(data.posts) ? data.posts : [],
        pagination: data.pagination ?? {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 1,
        },
      };
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getBySlug(slug: string): Promise<PublicBlogPost | null> {
    try {
      const { data } = await axiosClient.get<{ post: PublicBlogPost }>(
        `/blog-posts/${encodeURIComponent(slug)}`,
      );
      return data.post ?? null;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
