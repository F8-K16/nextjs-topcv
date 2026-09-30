import type { ReactNode } from "react";

import {
  adminLead,
  adminPageTitle,
  ADMIN_TOOLBAR,
  ADMIN_TOOLBAR_SHELL,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className={adminPageTitle}>{title}</h1>
        {description ? (
          <p className={cn("mt-1 max-w-2xl", adminLead)}>{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function AdminToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(ADMIN_TOOLBAR_SHELL, "space-y-2.5", className)}>
      {children}
    </div>
  );
}

export function AdminToolbarRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(ADMIN_TOOLBAR, className)}>{children}</div>;
}
