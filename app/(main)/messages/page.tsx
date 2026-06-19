import { Suspense } from "react";
import type { Metadata } from "next";

import MessagesPageClient from "./MessagesPageClient";

export const metadata: Metadata = {
  title: "Tin nhắn",
  description: "Trao đổi với nhà tuyển dụng và ứng viên.",
};

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
        Tin nhắn
      </h1>
      <p className="mb-6 text-sm text-zinc-500 md:mb-8">
        Cuộc trò chuyện với nhà tuyển dụng và ứng viên.
      </p>
      <Suspense
        fallback={
          <div className="text-center text-zinc-500">Đang tải…</div>
        }
      >
        <MessagesPageClient />
      </Suspense>
    </div>
  );
}
