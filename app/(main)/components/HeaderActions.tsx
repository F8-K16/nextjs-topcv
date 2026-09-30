"use client";

import { usePathname } from "next/navigation";

import { useAuthStore } from "@/app/stores/auth.store";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import NotificationBellDropdown from "@/components/NotificationBellDropdown";

export default function HeaderActions() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const showTheme = pathname.startsWith("/employer");

  if (!isAuthenticated && !showTheme) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {showTheme ? <AdminThemeToggle /> : null}
      {isAuthenticated ? <NotificationBellDropdown variant="main" /> : null}
    </div>
  );
}
