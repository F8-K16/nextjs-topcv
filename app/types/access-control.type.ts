export type AccessControlPermission = {
  id: number;
  name: string;
  actionId: number;
  actionName: string;
  actionStatus: boolean;
};

export type AccessControlModuleBucket = {
  moduleId: number;
  moduleName: string;
  moduleStatus: boolean;
  permissions: AccessControlPermission[];
};

export type AccessControlPermissionsResponse = {
  modules: AccessControlModuleBucket[];
  total: number;
};

export type AccessControlRoleListItem = {
  id: number;
  name: string;
  status: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  permissionCount: number;
  userCount: number;
  isProtected: boolean;
};

export type AccessControlRolesResponse = {
  roles: AccessControlRoleListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AccessControlRoleDetail = {
  id: number;
  name: string;
  status: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  permissionIds: number[];
  userCount: number;
  isProtected: boolean;
};

export type CreateRolePayload = {
  name: string;
  status?: boolean;
  permissionIds: number[];
};

export type UpdateRolePayload = CreateRolePayload;
