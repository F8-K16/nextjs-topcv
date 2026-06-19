import type { QueryClient } from "@tanstack/react-query";

import { invalidateJobsRecommendedQueries } from "./recommendation-queries";

export async function invalidatePublicJobListQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    queryClient.invalidateQueries({ queryKey: ["home-featured-jobs"] }),
    invalidateJobsRecommendedQueries(queryClient),
  ]);
}
