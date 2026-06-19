"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_APPLIED_JOB_IDS_MS } from "@/lib/query-stale-time";
import { applicationService } from "@/services/application.service";

export function useAppliedJobs() {
  const { isAuthenticated, user } = useAuthStore();
  const qc = useQueryClient();

  const { data: jobIds = [] } = useQuery({
    queryKey: ["applied-job-ids", user?.id],
    queryFn: () => applicationService.getAppliedJobIds(),
    enabled: isAuthenticated && user?.id != null,
    staleTime: STALE_APPLIED_JOB_IDS_MS,
  });

  const appliedJobIds = useMemo(() => new Set(jobIds), [jobIds]);

  const hasApplied = useCallback(
    (jobId: number) => appliedJobIds.has(jobId),
    [appliedJobIds],
  );

  const refetch = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["applied-job-ids"] });
  }, [qc]);

  return { appliedJobIds, hasApplied, refetch };
}
