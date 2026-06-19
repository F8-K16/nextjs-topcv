"use client";

import { useAuthStore } from "@/app/stores/auth.store";

import NotificationBellDropdown from "@/components/NotificationBellDropdown";

export default function HeaderActions() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <NotificationBellDropdown variant="main" />
    </div>
  );
}
