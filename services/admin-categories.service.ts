import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type AdminParentCategoryRow = {
  id: number;
  name: string;
  slug: string;
  _count?: {
    categories: number;
    companies: number;
  };
};

export type AdminChildCategoryRow = {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number;
  parentCategory?: { id: number; name: string; slug: string };
  _count?: {
    jobs: number;
  };
};

export type AdminParentCategoriesListResponse = {
  categories: AdminParentCategoryRow[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  } | null;
};

export const adminCategoriesService = {
  async listParentCategories(
    params: URLSearchParams,
  ): Promise<AdminParentCategoriesListResponse> {
    try {
      const res = await axiosClient.get<AdminParentCategoriesListResponse>(
        `/admin/category-parents?${params.toString()}`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listChildCategories(parentCategoryId: number): Promise<AdminChildCategoryRow[]> {
    try {
      const res = await axiosClient.get<{ categories: AdminChildCategoryRow[] }>(
        `/admin/categories?all=true&parentCategoryId=${parentCategoryId}`,
      );
      return res.data.categories ?? [];
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createParentCategory(body: {
    name: string;
    slug: string;
  }): Promise<AdminParentCategoryRow> {
    try {
      const res = await axiosClient.post<AdminParentCategoryRow>(
        `/admin/category-parents`,
        body,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateParentCategory(
    id: number,
    body: { name?: string; slug?: string },
  ): Promise<AdminParentCategoryRow> {
    try {
      const res = await axiosClient.put<AdminParentCategoryRow>(
        `/admin/category-parents/${id}`,
        body,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteParentCategory(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/category-parents/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createCategory(body: {
    name: string;
    slug: string;
    parentCategoryId: number;
  }): Promise<AdminChildCategoryRow> {
    try {
      const res = await axiosClient.post<AdminChildCategoryRow>(
        `/admin/categories`,
        body,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateCategory(
    id: number,
    body: { name?: string; slug?: string; parentCategoryId?: number },
  ): Promise<AdminChildCategoryRow> {
    try {
      const res = await axiosClient.put<AdminChildCategoryRow>(
        `/admin/categories/${id}`,
        body,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/categories/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
