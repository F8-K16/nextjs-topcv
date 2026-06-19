"use client";

import { useQuery } from "@tanstack/react-query";

import type { Job } from "@/app/types/job.type";
import { employerPortalService } from "@/services/employer-portal.service";
import EmployerJobForm from "../../../components/EmployerJobForm";
import {
  EmployerQueryError,
  EmployerQueryLoading,
} from "../../../employer-query-ui";
import { STALE_EMPLOYER_JOB_DETAIL_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";

type Props = { jobId: number };

export default function EmployerEditJobPageClient({ jobId: id }: Props) {
  const userId = useAuthStore((s) => s.user?.id);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-portal-job", userId, id],
    queryFn: () => employerPortalService.getJob(id),
    enabled: Number.isFinite(id) && id > 0 && userId != null,
    staleTime: STALE_EMPLOYER_JOB_DETAIL_MS,
  });

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <p className="text-sm text-red-600">{"ID không hợp lệ"}</p>
    );
  }

  if (userId == null || isPending) {
    return <EmployerQueryLoading label={"Đang tải tin…"} />;
  }

  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">{"Chỉnh sửa tin"}</h1>
      <EmployerJobForm mode="edit" jobId={id} initialJob={data as Job} />
    </div>
  );
}
