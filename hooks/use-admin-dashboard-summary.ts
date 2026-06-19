"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_ADMIN_DASHBOARD_SUMMARY_MS } from "@/lib/query-stale-time";
import { adminDashboardService } from "@/services/admin-dashboard.service";

export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: ["admin", "dashboard", "summary"],
    queryFn: () => adminDashboardService.getSummary(),
    staleTime: STALE_ADMIN_DASHBOARD_SUMMARY_MS,
  });
}
