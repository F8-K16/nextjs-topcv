import { fetchWrapper } from "@/utils/fetch";
import UsersTable from "./UsersTable";
import { API_BASE_URL } from "@/lib/api-base-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Người dùng",
  description: "Tìm kiếm và quản lý tài khoản người dùng.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    isVerified?: string;
    isBlocked?: string;
  }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = new URLSearchParams({
    page: params.page || "1",
    search: params.search || "",
    role: params.role || "",
    isVerified: params.isVerified || "",
    isBlocked: params.isBlocked || "",
  });
  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/users?${query}`,
  );
  const users = await res.json();

  return (
    <div className="space-y-8">
      <UsersTable data={users} />
    </div>
  );
}
