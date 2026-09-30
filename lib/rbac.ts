/**
 * RBAC – Roles & Permissions
 *
 * Role hierarchy (highest → lowest):
 *   ADMIN > MODERATOR > SUPPORT > EMPLOYER > CANDIDATE
 *
 * Permission strings follow the pattern: "resource:action"
 * e.g. "admin:jobs:read", "employer:jobs:create", "candidate:resumes:read"
 */

// ─── Role constants ─────────────────────────────────────────────────────────

export const ROLE = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  SUPPORT: "SUPPORT",
  EMPLOYER: "EMPLOYER",
  CANDIDATE: "CANDIDATE",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/** Roles that have access to the /admin panel */
export const ADMIN_ROLES: Role[] = [ROLE.ADMIN, ROLE.MODERATOR, ROLE.SUPPORT];

/** Roles that are employer-side */
export const EMPLOYER_ROLES: Role[] = [ROLE.EMPLOYER];

/** Roles that are candidate-side */
export const CANDIDATE_ROLES: Role[] = [ROLE.CANDIDATE];

// ─── Helper predicates ───────────────────────────────────────────────────────

/** Does the user have at least one of the given roles? */
export function hasAnyRole(userRoles: string[] | undefined, roles: Role[]): boolean {
  if (!userRoles?.length) return false;
  return roles.some((r) => userRoles.includes(r));
}

/** Does the user have ALL of the given roles? */
export function hasAllRoles(userRoles: string[] | undefined, roles: Role[]): boolean {
  if (!userRoles?.length) return false;
  return roles.every((r) => userRoles.includes(r));
}

/** Does the user have a specific permission string? */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: string,
): boolean {
  return userPermissions?.includes(permission) ?? false;
}

/**
 * Khớp `requirePermission` phía API: vai trò ADMIN được làm mọi thao tác admin,
 * kể cả khi danh sách quyền trong session chưa có chuỗi `admin:*`.
 */
export function canAdminPermission(
  userRoles: string[] | undefined,
  userPermissions: string[] | undefined,
  permission: string,
): boolean {
  if (userRoles?.includes(ROLE.ADMIN)) return true;
  return hasPermission(userPermissions, permission);
}

/** Does the user have at least one of the given permissions? */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: string[],
): boolean {
  if (!userPermissions?.length) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

/** Is this user an admin-panel user? */
export function isAdminUser(userRoles: string[] | undefined): boolean {
  return hasAnyRole(userRoles, ADMIN_ROLES);
}

/** Is this user an employer? */
export function isEmployer(userRoles: string[] | undefined): boolean {
  return hasAnyRole(userRoles, EMPLOYER_ROLES);
}

/** Is this user a candidate? */
export function isCandidate(userRoles: string[] | undefined): boolean {
  return hasAnyRole(userRoles, CANDIDATE_ROLES);
}

// ─── Feature visibility map ──────────────────────────────────────────────────
// Centralised "who can see what" for shared-platform UI.

export type FeatureKey =
  // Navigation / global
  | "nav:admin"
  | "nav:employer"
  | "nav:candidate"
  // Job-related
  | "jobs:apply"
  | "jobs:save"
  | "jobs:post"
  | "jobs:manage"
  // Resumes
  | "resumes:own"
  | "resumes:viewAll"
  // Applications
  | "applications:own"
  | "applications:reviewAll"
  // Company profile
  | "company:edit"
  | "company:viewMembers"
  // Notifications
  | "notifications:admin"
  | "notifications:employer"
  | "notifications:candidate";

/**
 * Returns true if the user (by roles + permissions) can see the given feature.
 * Rules are evaluated in order; first match wins.
 */
export function canSeeFeature(
  feature: FeatureKey,
  userRoles: string[] | undefined,
  userPermissions: string[] | undefined,
): boolean {
  const roles = userRoles ?? [];
  const perms = userPermissions ?? [];

  switch (feature) {
    case "nav:admin":
      return isAdminUser(roles);

    case "nav:employer":
      return isEmployer(roles) || isAdminUser(roles);

    case "nav:candidate":
      return isCandidate(roles) || !roles.length;

    case "jobs:apply":
    case "jobs:save":
      return isCandidate(roles);

    case "jobs:post":
    case "jobs:manage":
      return (
        isEmployer(roles) ||
        perms.includes("admin:jobs:create") ||
        perms.includes("admin:jobs:update")
      );

    case "resumes:own":
      return isCandidate(roles);

    case "resumes:viewAll":
      return isAdminUser(roles) || perms.includes("admin:resumes:read");

    case "applications:own":
      return isCandidate(roles) || isEmployer(roles);

    case "applications:reviewAll":
      return isAdminUser(roles) || perms.includes("admin:applications:read");

    case "company:edit":
      return isEmployer(roles) || perms.includes("admin:companies:update");

    case "company:viewMembers":
      return isEmployer(roles) || isAdminUser(roles);

    case "notifications:admin":
      return isAdminUser(roles);

    case "notifications:employer":
      return isEmployer(roles);

    case "notifications:candidate":
      return isCandidate(roles) || !roles.length;

    default:
      return false;
  }
}
