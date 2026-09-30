"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";

import { useAuthStore } from "@/app/stores/auth.store";
import { useRBAC } from "@/hooks/useRBAC";

import { STALE_SAVED_JOBS_MS } from "@/lib/query-stale-time";
import { savedJobService } from "@/services/saved-job.service";
import { SavedJob } from "@/app/types/job.type";

type Props = {
  jobId: number;
  size?: number;
};

export default function SaveJobButton({ jobId, size = 16 }: Props) {
  const { user, isAuthenticated } = useAuthStore();
  const { can } = useRBAC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const isCandidate = can("jobs:save");
  const queryKey = ["saved-jobs", user?.id];

  const { data: savedJobs = [] } = useQuery<SavedJob[]>({
    queryKey,
    queryFn: savedJobService.getSavedJobs,
    enabled: !!user?.id && isCandidate,
    staleTime: STALE_SAVED_JOBS_MS,
  });

  const isSaved = savedJobs.some((item) => item.jobId === jobId);

  const saveMutation = useMutation({
    mutationFn: savedJobService.saveJob,

    onMutate: async () => {
      setLoading(true);

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SavedJob[]>(queryKey) || [];

      queryClient.setQueryData<SavedJob[]>(queryKey, [
        ...previous,
        {
          candidateId: 0,
          jobId,
          createdAt: new Date().toISOString(),
        },
      ]);

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previous || []);
    },

    onSettled: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: savedJobService.unsaveJob,

    onMutate: async () => {
      setLoading(true);

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SavedJob[]>(queryKey) || [];

      queryClient.setQueryData<SavedJob[]>(
        queryKey,
        previous.filter((item) => item.jobId !== jobId),
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previous || []);
    },

    onSettled: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(next)}`);
      return;
    }

    if (!isCandidate) return;

    if (isSaved) {
      unsaveMutation.mutate(jobId);
    } else {
      saveMutation.mutate(jobId);
    }
  };

  if (isAuthenticated && !isCandidate) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center transition cursor-pointer
        ${
          isSaved
            ? "bg-green-500 border-green-500 text-white"
            : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
        }
      `}
    >
      {loading ? (
        <Loader2 size={size} className="animate-spin" />
      ) : (
        <Heart size={size} fill={isSaved ? "currentColor" : "none"} />
      )}
    </button>
  );
}
