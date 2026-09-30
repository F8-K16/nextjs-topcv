import type { Metadata } from "next";

import EmployerCompanyForm from "../components/EmployerCompanyForm";

export const metadata: Metadata = {
  title: "Hồ sơ công ty",
  description: "Cập nhật thông tin doanh nghiệp hiển thị trên TopCV.",
};

export default function EmployerCompanyPage() {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="border-b border-zinc-100 pb-3">
        <h1 className="text-lg font-bold tracking-tight text-zinc-900">
          Hồ sơ công ty
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Thông tin hiển thị với ứng viên. Chọn ít nhất một ngành để đăng tin.
        </p>
      </div>
      <div className="pt-4">
        <EmployerCompanyForm variant="page" />
      </div>
    </div>
  );
}
