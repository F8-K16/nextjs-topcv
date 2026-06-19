export type AuditLog = {
  id: number;
  actorUserId: number;
  actorUser?: {
    id: number;
    email: string;
    username: string;
  };
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  success: boolean;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
  createdAt: string;
};

export type AuditLogListResponse = {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

