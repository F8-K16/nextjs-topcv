import type { Metadata } from "next";
import { Suspense } from "react";

import ApplicationsTable from "./ApplicationsTable";

export const metadata: Metadata = {
  title: "Ứng tuyển",
  description: "Theo dõi hồ sơ ứng tuyển trên toàn hệ thống.",
};

export default function AdminApplicationsPage() {
  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <div className="text-gray-400 py-10 text-center">Đang tải…</div>
        }
      >
        <ApplicationsTable />
      </Suspense>
    </div>
  );
}
