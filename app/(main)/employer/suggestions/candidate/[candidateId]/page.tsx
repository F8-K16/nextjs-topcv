import type { Metadata } from "next";

import EmployerCandidateCvPageClient from "./EmployerCandidateCvPageClient";

export const metadata: Metadata = {
  title: "Hồ sơ ứng viên",
  description: "Xem CV và thông tin ứng viên.",
};

export default function EmployerCandidateCvPage() {
  return <EmployerCandidateCvPageClient />;
}
