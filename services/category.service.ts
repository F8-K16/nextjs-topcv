import { Category } from "@/app/types/category.type";
import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import { API_BASE_URL } from "@/lib/api-base-url";

export const categoryService = {
  async createCategory(data: {
    name: string;
    slug: string;
    parentCategoryId: number;
  }) {
    try {
      const res = await axiosClient.post<Category>("/admin/categories", data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async updateCategory(
    id: number,
    data: { name?: string; slug?: string; parentCategoryId?: number },
  ) {
    try {
      const res = await axiosClient.put<Category>(
        `/admin/categories/${id}`,
        data,
      );
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async deleteCategory(id: number) {
    try {
      await axiosClient.delete(`/admin/categories/${id}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getCategoriesByCompany(companyId: number) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/company/${companyId}/categories`,
      );
      return res.json();
    } catch {
      throw new Error("Có lỗi khi tải danh sách danh mục của công ty");
    }
  },

  async getAllCategories(params?: { all?: boolean; search?: string; page?: number }) {
    try {
      const res = await axiosClient.get<{
        categories: Category[];
        pagination: { page: number; totalPages: number; totalItems: number } | null;
      }>("/admin/categories", { params });
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
