import type { Metadata } from "next";
import SalaryInsightSection from "../components/home/SalaryInsightSection";

export const metadata: Metadata = {
  title: "Salary Insight — Mức lương trung bình",
  description:
    "Biểu đồ mức lương trung bình theo ngành và khu vực, tổng hợp từ tin tuyển dụng đang mở trên TopCV.",
};

export const revalidate = 1800;

export default function SalaryInsightsPage() {
  return (
    <div className="min-h-0 w-full bg-zinc-50/50">
      <SalaryInsightSection />
    </div>
  );
}
