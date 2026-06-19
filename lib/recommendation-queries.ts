import type { QueryClient } from "@tanstack/react-query";

export const JOBS_RECOMMENDED_QUERY_KEY = ["jobs-recommended"] as const;

export function jobsRecommendedListQueryKey(
  userId: number | undefined,
  page: number,
  limit: number,
) {
  return [...JOBS_RECOMMENDED_QUERY_KEY, userId ?? "anon", page, limit] as const;
}

export async function invalidateJobsRecommendedQueries(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: [...JOBS_RECOMMENDED_QUERY_KEY] });
}
