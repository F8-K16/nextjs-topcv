import type { Metadata } from "next";

import SavedJobList from "./SavedJobList";
import { Bookmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Việc đã lưu",
  description: "Danh sách tin tuyển dụng bạn đã lưu để xem lại.",
};

export default function SavedJobsPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f3f5f7] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#00b14f] border border-[#00b14f]/20 mb-2">
              <Bookmark className="h-3.5 w-3.5" />
              Danh sách của bạn
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Việc làm đã lưu
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Theo dõi tin đã lưu để ứng tuyển đúng lúc
            </p>
          </div>
        </header>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-8">
          <SavedJobList />
        </div>
      </div>
    </div>
  );
}
