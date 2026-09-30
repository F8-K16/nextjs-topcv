import type { Metadata } from "next";

import AppliedJobsClient from "./AppliedJobsClient";

export const metadata: Metadata = {
  title: "Việc đã ứng tuyển",
  description: "Theo dõi trạng thái các đơn ứng tuyển của bạn.",
};

export default function AppliedJobsPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f3f5f7] py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Việc làm đã ứng tuyển</h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi trạng thái đơn. Chọn nhiều dòng để copy link tin hoặc rút
            các đơn đang chờ nhà tuyển dụng xem.
          </p>
        </header>
        <AppliedJobsClient />
      </div>
    </div>
  );
}
