import type { Metadata } from "next";

import CvTemplatesAdminTable from "./CvTemplatesAdminTable";

export const metadata: Metadata = {
  title: "Mẫu CV",
  description: "Quản lý mẫu CV cho trình soạn thảo.",
};

export default function AdminCvTemplatesPage() {
  return <CvTemplatesAdminTable />;
}
