import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactAdminInner } from "./ContactAdminInner";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Tin nhắn từ form liên hệ công khai.",
};

export default function AdminContactPage() {
  return (
    <Suspense
      fallback={<div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />}
    >
      <ContactAdminInner />
    </Suspense>
  );
}
