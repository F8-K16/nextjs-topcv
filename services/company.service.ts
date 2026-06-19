import axiosClient from "@/lib/axios";
import {
  Company,
  CompanyResponse,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/app/types/company.type";
import { handleAxiosError } from "@/utils/helper";
import { API_BASE_URL } from "@/lib/api-base-url";

export const companyService = {
  async getCompanies(query: string): Promise<CompanyResponse> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/companies?${query}`,
      );

      return res.json();
    } catch {
      throw new Error("Đã có lỗi khi tải danh sách công ty");
    }
  },
  async createCompany(data: CreateCompanyPayload) {
    try {
      const res = await axiosClient.post<Company>("/admin/companies", data);
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async updateCompany(id: number, data: UpdateCompanyPayload) {
    try {
      const res = await axiosClient.put<Company>(
        `/admin/companies/${id}`,
        data,
      );
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async deleteCompany(id: number) {
    try {
      const res = await axiosClient.delete<{ success: boolean }>(
        `/admin/companies/${id}`,
      );
      return res.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
