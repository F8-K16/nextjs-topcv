import type { QueryClient } from "@tanstack/react-query";

export async function invalidateEmployerPortalJobQueries(
  queryClient: QueryClient,
  opts?: { updatedJobId?: number },
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["employer-portal-jobs"] }),
    queryClient.invalidateQueries({ queryKey: ["employer-portal-dashboard"] }),
    ...(opts?.updatedJobId != null
      ? [
          queryClient.invalidateQueries({
            queryKey: ["employer-portal-job", opts.updatedJobId],
          }),
        ]
      : []),
  ]);
}
