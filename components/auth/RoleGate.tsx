/**
 * RBAC gate components
 *
 * <RoleGate roles={["ADMIN", "MODERATOR"]}>  — show only for those roles
 * <PermissionGate perm="admin:jobs:read">    — show only if user has permission
 * <FeatureGate feature="jobs:apply">         — show based on canSeeFeature()
 *
 * All components render nothing while auth is loading (no flicker).
 * Pass `fallback` to render something else for unauthorised users.
 */
"use client";

import type { ReactNode } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import type { FeatureKey, Role } from "@/lib/rbac";

// ─── RoleGate ────────────────────────────────────────────────────────────────

type RoleGateProps = {
  /** User must have at least one of these roles */
  roles: Role[];
  children: ReactNode;
  /** Rendered when the user does NOT meet the role requirement */
  fallback?: ReactNode;
};

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { loading, hasRole } = useRBAC();
  if (loading) return null;
  return hasRole(...roles) ? <>{children}</> : <>{fallback}</>;
}

// ─── PermissionGate ──────────────────────────────────────────────────────────

type PermissionGateProps = {
  /** User must have this exact permission string */
  perm: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({ perm, children, fallback = null }: PermissionGateProps) {
  const { loading, hasPerm } = useRBAC();
  if (loading) return null;
  return hasPerm(perm) ? <>{children}</> : <>{fallback}</>;
}

// ─── AnyPermissionGate ───────────────────────────────────────────────────────

type AnyPermissionGateProps = {
  /** User must have at least one of these permissions */
  perms: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function AnyPermissionGate({ perms, children, fallback = null }: AnyPermissionGateProps) {
  const { loading, hasAnyPerm } = useRBAC();
  if (loading) return null;
  return hasAnyPerm(...perms) ? <>{children}</> : <>{fallback}</>;
}

// ─── FeatureGate ─────────────────────────────────────────────────────────────

type FeatureGateProps = {
  /** Feature key from FeatureKey union */
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
};

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { loading, can } = useRBAC();
  if (loading) return null;
  return can(feature) ? <>{children}</> : <>{fallback}</>;
}

// ─── AuthGate (must be logged in at all) ─────────────────────────────────────

type AuthGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function AuthGate({ children, fallback = null }: AuthGateProps) {
  const { loading, isAuthenticated } = useRBAC();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

// ─── GuestGate (must NOT be logged in) ───────────────────────────────────────

export function GuestGate({ children, fallback = null }: AuthGateProps) {
  const { loading, is } = useRBAC();
  if (loading) return null;
  return is.guest ? <>{children}</> : <>{fallback}</>;
}
