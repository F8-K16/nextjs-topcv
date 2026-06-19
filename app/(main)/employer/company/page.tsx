import type { Metadata } from "next";

import EmployerCompanyForm from "../components/EmployerCompanyForm";

export const metadata: Metadata = {
  title: "Hồ sơ công ty",
  description: "Cập nhật thông tin doanh nghiệp hiển thị trên TopCV.",
};

export default function EmployerCompanyPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-zinc-100 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {"Hồ sơ công ty"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
            {
              "Cập nhật thông tin hiển thị và danh mục ngành. Danh mục là bắt buộc để đăng tin tuyển dụng đúng ngành."
            }
          </p>
        </div>
        <div className="pt-6">
          <EmployerCompanyForm variant="page" />
        </div>
      </div>
    </div>
  );
}
