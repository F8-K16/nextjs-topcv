import { Suspense } from "react";
import type { Metadata } from "next";

import CvTemplatesGallery from "./CvTemplatesGallery";
import CvTemplatesHeader from "./CvTemplatesHeader";

export const metadata: Metadata = {
  title: "Mẫu CV",
  description: "Chọn mẫu CV chuyên nghiệp và tạo hồ sơ nhanh chóng.",
};

export default function CvTemplatesPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#f3f5f7] px-3 py-8 sm:px-4 sm:py-10">
      <div className="mx-auto min-w-0 max-w-6xl space-y-5 sm:space-y-6">
        <CvTemplatesHeader />
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50 sm:p-5 md:p-8">
          <Suspense>
            <CvTemplatesGallery />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
