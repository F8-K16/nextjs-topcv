import type { Metadata } from "next";
import AdminSecurityPageClient from "./AdminSecurityPageClient";

export const metadata: Metadata = {
  title: "Xác thực hai lớp",
};

export default function AdminSecurityPage() {
  return <AdminSecurityPageClient />;
}
