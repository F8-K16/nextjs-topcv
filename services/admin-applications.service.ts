import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type { EmployerApplicationPreview } from "@/services/employer-portal.service";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "ACCEPTED"
  | "REJECTED";

export type AdminApplicationsPayload = {
  applications: unknown[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};


export type AdminApplicationPreview = Omit<
  EmployerApplicationPreview,
  "job"
> & {
  job: {
    id: number;
    title: string;
    company: { id: number; name: string };
  };
};

export async function fetchAdminApplications(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  jobId?: number;
}): Promise<AdminApplicationsPayload> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.status) searchParams.set("status", params.status);
    if (params.search) searchParams.set("search", params.search);
    if (params.jobId) searchParams.set("jobId", String(params.jobId));

    const res = await axiosClient.get(
      `/admin/applications?${searchParams.toString()}`,
    );
    const body = res.data as {
      success?: boolean;
      data?: AdminApplicationsPayload;
    };
    if (!body.data) {
      throw new Error("Phản hồi API không hợp lệ");
    }
    return body.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
}

export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus,
) {
  try {
    const res = await axiosClient.patch(`/admin/applications/${id}/status`, {
      status,
    });
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
}

export async function fetchAdminApplicationPreview(
  applicationId: number,
): Promise<AdminApplicationPreview> {
  try {
    const res = await axiosClient.get(
      `/admin/applications/${encodeURIComponent(String(applicationId))}/preview`,
    );
    const body = res.data as {
      success?: boolean;
      data?: AdminApplicationPreview;
    };
    if (!body.data) {
      throw new Error("Phản hồi API không hợp lệ");
    }
    return body.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
}
