export type PublicBlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverUrl?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: number; username: string } | null;
};

export type BlogListResponse = {
  posts: PublicBlogPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
