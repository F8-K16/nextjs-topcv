import type { Metadata } from "next";
import { Suspense } from "react";

import { LocationsPageInner } from "./LocationsPageInner";

export const metadata: Metadata = {
  title: "Địa điểm",
  description: "Tỉnh, thành và quận huyện phục vụ lọc việc làm.",
};

export default function AdminLocationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/[0.06]" />
        </div>
      }
    >
      <LocationsPageInner />
    </Suspense>
  );
}
