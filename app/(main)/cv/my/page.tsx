import type { Metadata } from "next";

import MyCvsClient from "./MyCvsClient";

export const metadata: Metadata = {
  title: "CV của tôi",
  description: "Quản lý các bản CV bạn đang soạn thảo.",
};

export default function MyCvsPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#f3f5f7] px-3 py-8 sm:px-4 sm:py-10">
      <div className="mx-auto min-w-0 max-w-5xl">
        <MyCvsClient />
      </div>
    </div>
  );
}
