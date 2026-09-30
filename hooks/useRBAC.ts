import { useAuthStore } from "@/app/stores/auth.store";
import {
  canSeeFeature,
  FeatureKey,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  isAdminUser,
  isCandidate,
  isEmployer,
  Role,
} from "@/lib/rbac";

/**
 * Lightweight RBAC hook — reads auth state from the store and exposes
 * helpers that components can use to guard UI.
 *
 * @example
 * const { can, hasRole, is } = useRBAC();
 *
 * // Feature flag
 * if (!can("jobs:apply")) return null;
 *
 * // Role check
 * if (hasRole("ADMIN")) { ... }
 *
 * // Permission check
 * if (is.admin) { ... }
 */
export function useRBAC() {
  const user = useAuthStore((s) => s.user);
  const loadingAuth = useAuthStore((s) => s.loadingAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const roles = user?.roles ?? [];
  const permissions = user?.permissions ?? [];

  return {
    /** True while the auth session is being loaded */
    loading: loadingAuth,
    isAuthenticated,
    roles,
    permissions,
    user,

    /** Feature visibility check */
    can: (feature: FeatureKey) => canSeeFeature(feature, roles, permissions),

    /** Check if user has at least one of the given roles */
    hasRole: (...requiredRoles: Role[]) => hasAnyRole(roles, requiredRoles),

    /** Check if user has a specific permission string */
    hasPerm: (permission: string) => hasPermission(permissions, permission),

    /** Check if user has at least one of the given permissions */
    hasAnyPerm: (...perms: string[]) => hasAnyPermission(permissions, perms),

    /** Convenience role flags */
    is: {
      admin: isAdminUser(roles),
      employer: isEmployer(roles),
      candidate: isCandidate(roles),
      adminOrModerator:
        roles.includes("ADMIN") || roles.includes("MODERATOR"),
      guest: !isAuthenticated && !loadingAuth,
    },
  };
}
