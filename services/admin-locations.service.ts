import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type AdminProvinceRow = {
  id: number;
  name: string;
  code: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    districts: number;
    companies: number;
    candidates: number;
  };
};

export type AdminProvincesListResponse = {
  provinces: AdminProvinceRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminDistrictRow = {
  id: number;
  name: string;
  provinceId: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    companies: number;
    candidates: number;
    preferences: number;
  };
};

export type AdminDistrictsResponse = {
  province: { id: number; name: string };
  districts: AdminDistrictRow[];
};

export const adminLocationsService = {
  async listProvinces(params: URLSearchParams): Promise<AdminProvincesListResponse> {
    try {
      const res = await axiosClient.get<AdminProvincesListResponse>(
        `/admin/locations/provinces?${params.toString()}`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createProvince(body: {
    name: string;
    code?: string;
  }): Promise<{ id: number; name: string; code: string | null }> {
    try {
      const res = await axiosClient.post(`/admin/locations/provinces`, body);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateProvince(
    id: number,
    body: { name?: string; code?: string | null },
  ): Promise<{ id: number; name: string; code: string | null }> {
    try {
      const res = await axiosClient.put(
        `/admin/locations/provinces/${id}`,
        body,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteProvince(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/locations/provinces/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listDistricts(provinceId: number): Promise<AdminDistrictsResponse> {
    try {
      const res = await axiosClient.get<AdminDistrictsResponse>(
        `/admin/locations/provinces/${provinceId}/districts`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createDistrict(body: {
    provinceId: number;
    name: string;
  }): Promise<AdminDistrictRow> {
    try {
      const res = await axiosClient.post(`/admin/locations/districts`, body);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateDistrict(
    id: number,
    body: { name: string },
  ): Promise<AdminDistrictRow> {
    try {
      const res = await axiosClient.put(
        `/admin/locations/districts/${id}`,
        body,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteDistrict(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/locations/districts/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
