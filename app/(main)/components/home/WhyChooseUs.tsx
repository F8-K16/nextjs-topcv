import { Gauge, ShieldCheck, Sparkles, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  {
    icon: Gauge,
    title: "Tốc độ & cache thông minh",
    body: "Next.js ISR + TanStack Query — trang chủ và danh sách việc phản hồi tức thì.",
  },
  {
    icon: Sparkles,
    title: "Gợi ý phù hợp",
    body: "Lọc theo lương, kinh nghiệm, hình thức, địa điểm — URL đồng bộ để chia sẻ và SEO.",
  },
  {
    icon: ShieldCheck,
    title: "Uy tín & kiểm duyệt",
    body: "Tin tuyển và nhà tuyển dụng được quản trị — giảm spam, tăng chất lượng ứng viên.",
  },
  {
    icon: Users,
    title: "Trải nghiệm ứng viên",
    body: "Lưu việc, nộp đơn nhanh, theo dõi hồ sơ — giao diện responsive trên mọi thiết bị.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="border-y border-zinc-200/80 bg-white py-10 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Vì sao chọn chúng tôi
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900 md:text-3xl">
            Chuẩn production cho thị trường Việt Nam
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }, index) => (
            <div
              key={title}
              className={cn(
                "rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md sm:p-6",
                index >= 2 && "hidden md:block",
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
