import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";
import type {
  AccessControlPermissionsResponse,
  AccessControlRoleDetail,
  AccessControlRolesResponse,
  CreateRolePayload,
  UpdateRolePayload,
} from "@/app/types/access-control.type";

export const adminAccessControlService = {
  async listPermissions(): Promise<AccessControlPermissionsResponse> {
    try {
      const res = await axiosClient.get<AccessControlPermissionsResponse>(
        "/admin/access-control/permissions",
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listRoles(
    params: URLSearchParams,
  ): Promise<AccessControlRolesResponse> {
    try {
      const res = await axiosClient.get<AccessControlRolesResponse>(
        `/admin/access-control/roles?${params.toString()}`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async getRole(id: number): Promise<AccessControlRoleDetail> {
    try {
      const res = await axiosClient.get<AccessControlRoleDetail>(
        `/admin/access-control/roles/${id}`,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async createRole(
    payload: CreateRolePayload,
  ): Promise<AccessControlRoleDetail> {
    try {
      const res = await axiosClient.post<AccessControlRoleDetail>(
        "/admin/access-control/roles",
        payload,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async updateRole(
    id: number,
    payload: UpdateRolePayload,
  ): Promise<AccessControlRoleDetail> {
    try {
      const res = await axiosClient.put<AccessControlRoleDetail>(
        `/admin/access-control/roles/${id}`,
        payload,
      );
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteRole(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/access-control/roles/${id}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
