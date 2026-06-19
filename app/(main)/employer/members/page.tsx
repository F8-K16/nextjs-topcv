import type { Metadata } from "next";

import EmployerMembersPageClient from "./EmployerMembersPageClient";

export const metadata: Metadata = {
  title: "Thành viên công ty",
  description: "Quản lý tài khoản nhân viên HR trong doanh nghiệp.",
};

export default function EmployerMembersPage() {
  return <EmployerMembersPageClient />;
}
