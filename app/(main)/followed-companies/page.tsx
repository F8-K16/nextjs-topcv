import type { Metadata } from "next";

import { Building2 } from "lucide-react";
import FollowedCompaniesList from "./FollowedCompaniesList";

export const metadata: Metadata = {
  title: "Công ty đã theo dõi",
  description: "Cập nhật từ các nhà tuyển dụng bạn đang theo dõi.",
};

export default function FollowedCompaniesPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f3f5f7] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00b14f]/20 bg-white px-3 py-1 text-xs font-medium text-[#00b14f]">
              <Building2 className="h-3.5 w-3.5" />
              Công ty
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Công ty đã theo dõi
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Cập nhật tin tuyển dụng từ các doanh nghiệp bạn quan tâm
            </p>
          </div>
        </header>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
          <FollowedCompaniesList />
        </div>
      </div>
    </div>
  );
}
