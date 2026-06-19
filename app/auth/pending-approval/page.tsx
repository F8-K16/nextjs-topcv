import type { Metadata } from "next";

import PendingApprovalClient from "./PendingApprovalClient";

export const metadata: Metadata = {
  title: "Chờ duyệt",
  description: "Tài khoản đang chờ quản trị viên phê duyệt.",
};

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-b from-[#f3f5f7] to-white py-12">
      <PendingApprovalClient />
    </div>
  );
}
