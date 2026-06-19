import axiosClient from "@/lib/axios";
import type {
  CreateCvPayload,
  Cv,
  CvListItem,
  PublicCv,
  CvTemplate,
  CvTemplateSummary,
  UpdateCvPayload,
} from "@/app/types/cv.type";
import { handleAxiosError } from "@/utils/helper";

export const cvService = {
  async listTemplatesAdmin(): Promise<CvTemplate[]> {
    try {
      const { data } = await axiosClient.get<{ templates: CvTemplate[] }>(
        "/admin/cv-templates",
      );
      return data.templates;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async createTemplateAdmin(payload: {
    name: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    templateData: Record<string, unknown>;
    isActive?: boolean;
  }) {
    try {
      const { data } = await axiosClient.post<CvTemplate>(
        "/admin/cv-templates",
        payload,
      );
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async updateTemplateAdmin(
    id: number,
    payload: {
      name?: string;
      description?: string | null;
      thumbnailUrl?: string | null;
      templateData?: Record<string, unknown>;
      isActive?: boolean;
    },
  ) {
    try {
      const { data } = await axiosClient.put<CvTemplate>(
        `/admin/cv-templates/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async deleteTemplateAdmin(id: number) {
    try {
      const { data } = await axiosClient.delete<{ success: boolean }>(
        `/admin/cv-templates/${id}`,
      );
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async listTemplates(): Promise<CvTemplateSummary[]> {
    try {
      const { data } = await axiosClient.get<{ templates: CvTemplateSummary[] }>(
        "/cv/templates",
      );
      return data.templates;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getTemplate(id: number): Promise<CvTemplate> {
    try {
      const { data } = await axiosClient.get<CvTemplate>(
        `/cv/templates/${id}`,
      );
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async createCv(payload: CreateCvPayload): Promise<Cv> {
    try {
      const { data } = await axiosClient.post<Cv>("/cvs", payload);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async listMyCvs(): Promise<CvListItem[]> {
    try {
      const { data } = await axiosClient.get<{ cvs: CvListItem[] }>(
        "/cvs/my",
      );
      return data.cvs;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getCv(id: number): Promise<Cv> {
    try {
      const { data } = await axiosClient.get<Cv>(`/cvs/${id}`);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async updateCv(id: number, payload: UpdateCvPayload): Promise<Cv> {
    try {
      const { data } = await axiosClient.patch<Cv>(`/cvs/${id}`, payload);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async deleteCv(id: number) {
    try {
      const { data } = await axiosClient.delete<{ success: boolean }>(
        `/cvs/${id}`,
      );
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getPublicCv(id: number): Promise<PublicCv> {
    try {
      const { data } = await axiosClient.get<PublicCv>(`/cv/public/${id}`);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async getCvForAdmin(id: number): Promise<PublicCv> {
    try {
      const { data } = await axiosClient.get<PublicCv>(`/admin/cvs/${id}`);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async publishCvAsResume(id: number) {
    try {
      const { data } = await axiosClient.post(`/cvs/${id}/publish-resume`);
      return data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
