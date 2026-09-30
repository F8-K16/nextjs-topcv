import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { BlogListResponse, PublicBlogPost } from "@/app/types/blog.type";

export type BlogPostInput = {
  title: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  slug?: string;
  published?: boolean;
};

export const adminBlogService = {
  async list(params: URLSearchParams): Promise<BlogListResponse> {
    try {
      const { data } = await axiosClient.get<BlogListResponse>(
        `/admin/blog-posts?${params.toString()}`,
      );
      return data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async get(id: number): Promise<PublicBlogPost> {
    try {
      const { data } = await axiosClient.get<{ post: PublicBlogPost }>(
        `/admin/blog-posts/${id}`,
      );
      return data.post;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async create(input: BlogPostInput): Promise<PublicBlogPost> {
    try {
      const { data } = await axiosClient.post<{ post: PublicBlogPost }>(
        "/admin/blog-posts",
        input,
      );
      return data.post;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async update(id: number, input: BlogPostInput): Promise<PublicBlogPost> {
    try {
      const { data } = await axiosClient.put<{ post: PublicBlogPost }>(
        `/admin/blog-posts/${id}`,
        input,
      );
      return data.post;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/blog-posts/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
