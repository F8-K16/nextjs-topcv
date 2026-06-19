import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type AdminSkill = {
  id: number;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
  _count: { jobSkills: number };
};

export type AdminSkillsListResponse = {
  skills: AdminSkill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminSkillSelect = { id: number; name: string };

export const adminSkillsService = {
  async selectAll(): Promise<AdminSkillSelect[]> {
    try {
      const res = await axiosClient.get<{ skills: AdminSkillSelect[] }>(
        "/admin/skills/select",
      );
      return res.data.skills ?? [];
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async list(params: URLSearchParams): Promise<AdminSkillsListResponse> {
    try {
      const res = await axiosClient.get<AdminSkillsListResponse>(
        `/admin/skills?${params.toString()}`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async create(name: string): Promise<AdminSkill> {
    try {
      const res = await axiosClient.post<AdminSkill>("/admin/skills", {
        name,
      });
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async update(id: number, name: string): Promise<AdminSkill> {
    try {
      const res = await axiosClient.put<AdminSkill>(`/admin/skills/${id}`, {
        name,
      });
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/skills/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
