export type User = {
  id: number;
  email: string;
  username: string;
  avatar?: string | null;
  isVerified: boolean;
  isBlocked?: boolean;
  userPhone?: {
    phone: string;
  };
  userRoles: {
    role: Role;
  }[];
};

export type Role = {
  id: number;
  name: string;
};

export type UsersResponse = {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  query: Record<string, string>;
  roles: Role[];
};

export type PendingEmployer = {
  id: number;
  employerId: number;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;

  userPhone?: {
    phone: string;
  };

  userRoles: {
    role: {
      name: string;
    };
  }[];

  employerStatus: "PENDING" | "APPROVED" | "REJECTED";

  company?: {
    id: number;
    name: string;
    location: string;
    district?: {
      name: string;
    };
    province?: {
      name: string;
    };
  };
};
