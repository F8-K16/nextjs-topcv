"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { GC_DEFAULT_MS, STALE_DEFAULT_MS } from "@/lib/query-stale-time";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_DEFAULT_MS,
        gcTime: GC_DEFAULT_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
