import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { PublicCv } from "@/app/types/cv.type";

export type EmployerSuggestedResumePreview =
  | { kind: "upload"; fileUrl: string }
  | { kind: "template"; cv: PublicCv };

export type EmployerSuggestedCandidateCvResponse = {
  candidate: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      avatar: string | null;
    };
    province: { name: string } | null;
    district: { name: string } | null;
  };
  resume: {
    id: number;
    title: string;
    updatedAt: string;
    preview: EmployerSuggestedResumePreview;
  } | null;
};

export type EmployerApplicationPreview = {
  applicationId: number;
  coverLetter: string | null;
  job: { id: number; title: string };
  candidate: {
    user: { id: number; username: string; email: string };
    province?: { name: string } | null;
    district?: { name: string } | null;
  };
  resume:
    | { kind: "none" }
    | { kind: "upload"; title: string; fileUrl: string }
    | { kind: "template"; title: string; cv: PublicCv };
};

export type EmployerJobAnalytics = {
  summary: {
    jobs: number;
    views: number;
    applications: number;
    conversionRate: number;
  };
  sources: Array<{ source: string; views: number }>;
  jobs: Array<{
    id: number;
    title: string;
    slug: string;
    moderationStatus: string;
    createdAt: string;
    views: number;
    applications: number;
    conversionRate: number;
    sources: Array<{ source: string; views: number }>;
  }>;
};

export type EmployerFormMeta = {
  company: {
    id: number;
    name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    location: string;
    status: boolean;
    provinceId: number;
    districtId: number;
  };
  categories: {
    id: number;
    name: string;
    slug?: string;
    parentCategoryId: number;
  }[];
  parentCategories: {
    id: number;
    name: string;
    slug?: string;
  }[];
  selectedParentCategoryIds: number[];
  skills: { id: number; name: string }[];
};

export type EmployerDashboardData = {
  company: { id: number; name: string; logo: string | null; status: boolean };
  user: { id: number; username: string; email: string };
  stats: {
    jobs: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    applications: {
      total: number;
      pending: number;
      reviewed: number;
      accepted: number;
      rejected: number;
    };
  };
  recentJobs: Array<{
    id: number;
    title: string;
    moderationStatus: string;
    category?: { id: number; name: string };
    _count?: { applications: number };
  }>;
  recentApplications: Array<{
    id: number;
    status: string;
    createdAt: string;
    candidate: {
      user: { id: number; username: string; email: string };
    };
    job: { id: number; title: string };
    resume?: { id: number; title: string } | null;
  }>;
};

export const employerPortalService = {
  async me() {
    try {
      const res = await axiosClient.get("/employer-portal/me");
      return res.data as {
        employer: { id: number; companyId: number; status: string };
        company: {
          id: number;
          name: string;
          logo: string | null;
          status: boolean;
        };
      };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listCompanyMembers() {
    try {
      const res = await axiosClient.get<{
        members: Array<{
          employerId: number;
          userId: number;
          username: string;
          email: string | null;
          phone: string | null;
        }>;
      }>("/employer-portal/company-members");
      return res.data.members;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async dashboard() {
    try {
      const res = await axiosClient.get("/employer-portal/dashboard");
      return res.data as EmployerDashboardData;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async analytics() {
    try {
      const res = await axiosClient.get("/employer-portal/analytics");
      return res.data as EmployerJobAnalytics;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async formMeta() {
    try {
      const res = await axiosClient.get("/employer-portal/form-meta");
      return res.data as EmployerFormMeta;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listSkills(search = "") {
    try {
      const qs = search.trim()
        ? `?search=${encodeURIComponent(search.trim())}`
        : "";
      const res = await axiosClient.get(`/employer-portal/skills${qs}`);
      return res.data as { skills: { id: number; name: string }[] };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createSkill(name: string) {
    try {
      const res = await axiosClient.post("/employer-portal/skills", { name });
      return res.data as { id: number; name: string };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateCompany(body: {
    name: string;
    description?: string;
    location: string;
    website?: string;
    logo?: string;
    provinceId: number;
    districtId: number;
    categoryIds: number[];
  }) {
    try {
      const res = await axiosClient.patch("/employer-portal/company", body);
      return res.data as { success: boolean; data: unknown };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listJobs(params: string) {
    try {
      const res = await axiosClient.get(`/employer-portal/jobs?${params}`);
      return res.data as {
        jobs: unknown[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async getJob(id: number) {
    try {
      const res = await axiosClient.get(`/employer-portal/jobs/${id}`);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createJob(body: Record<string, unknown>) {
    try {
      const res = await axiosClient.post("/employer-portal/jobs", body);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateJob(id: number, body: Record<string, unknown>) {
    try {
      const res = await axiosClient.patch(`/employer-portal/jobs/${id}`, body);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteJob(id: number) {
    try {
      const res = await axiosClient.delete(`/employer-portal/jobs/${id}`);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listApplications(params: string) {
    try {
      const res = await axiosClient.get(
        `/employer-portal/applications?${params}`,
      );
      return res.data as {
        applications: unknown[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateApplicationStatus(id: number, status: string) {
    try {
      const res = await axiosClient.patch(
        `/employer-portal/applications/${id}/status`,
        { status },
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async suggestedCandidates(opts: {
    limit?: number;
    page?: number;
    jobId?: number;
    provinceId?: number;
    experienceLevel?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (opts.limit != null) params.set("limit", String(opts.limit));
      if (opts.page != null) params.set("page", String(opts.page));
      if (opts.jobId != null) params.set("jobId", String(opts.jobId));
      if (opts.provinceId != null) params.set("provinceId", String(opts.provinceId));
      if (opts.experienceLevel) params.set("experienceLevel", opts.experienceLevel);
      const qs = params.size ? `?${params.toString()}` : "";
      const res = await axiosClient.get<{
        items: Array<{
          candidateId: number;
          user: {
            id: number;
            username: string;
            email: string;
            avatar: string | null;
          };
          province: { name: string } | null;
          district: { name: string } | null;
          reason: "applied" | "category_match" | "skill_match" | "multi_match";
          matchedSkillCount: number;
          matchedCategoryCount: number;
          hint: string;
        }>;
        pagination: { total: number; page: number; limit: number; totalPages: number };
        context: { jobCount: number; categoryIds: number[]; skillCount: number };
      }>(`/employer-portal/suggested-candidates${qs}`);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async getSuggestedCandidateCv(candidateId: number) {
    try {
      const res = await axiosClient.get<EmployerSuggestedCandidateCvResponse>(
        `/employer-portal/suggested-candidates/${candidateId}/cv`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async getApplicationPreview(applicationId: number) {
    try {
      const res = await axiosClient.get<EmployerApplicationPreview>(
        `/employer-portal/applications/${encodeURIComponent(String(applicationId))}/preview`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createEmployerInvite(body: { email: string }) {
    try {
      const res = await axiosClient.post<{
        inviteUrl: string;
        token: string;
        emailSent: boolean;
      }>("/employer-portal/invites", body);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
