import type { Metadata } from "next";
import { BarChart3, FileText, MessageSquareText, Send } from "lucide-react";
import FormUploadCV from "../../resume/upload/FormUpload";

export const metadata: Metadata = {
  title: "Tải CV lên",
  description:
    "Đăng CV một lần — theo dõi lượt xem và chia sẻ link với nhà tuyển dụng.",
};

const features = [
  {
    icon: FileText,
    title: "Nhận về các cơ hội tốt nhất",
    desc: "CV của bạn sẽ được ưu tiên hiển thị với các nhà tuyển dụng đã xác thực. Nhận được lời mời với những cơ hội việc làm hấp dẫn từ các doanh nghiệp uy tín.",
  },
  {
    icon: BarChart3,
    title: "Theo dõi số liệu, tối ưu CV",
    desc: "Theo dõi số lượt xem CV. Biết chính xác nhà tuyển dụng nào trên TopCV đang quan tâm đến CV của bạn.",
  },
  {
    icon: Send,
    title: "Chia sẻ CV bất cứ nơi đâu",
    desc: "Upload một lần và sử dụng đường link gửi tới nhiều nhà tuyển dụng.",
  },
  {
    icon: MessageSquareText,
    title: "Kết nối nhanh chóng",
    desc: "Dễ dàng kết nối với các nhà tuyển dụng nào xem và quan tâm tới CV của bạn",
  },
];

export default function UploadResumePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f5f7] py-6 sm:py-8">
      <div className="mx-auto min-w-0 max-w-6xl px-3 sm:px-4">
        <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#00a844] via-[#00b14f] to-[#2e8b57] px-4 py-6 text-white shadow-md sm:rounded-2xl sm:px-8 sm:py-8">
          <h1 className="text-xl font-bold leading-snug tracking-normal sm:text-2xl md:text-[1.65rem] md:leading-tight md:tracking-tight">
            Tải CV lên — cơ hội việc làm dễ tìm thấy bạn hơn
          </h1>
        </div>

        <div className="relative z-10 -mt-4 sm:-mt-5">
          <FormUploadCV />
        </div>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200/50 sm:rounded-2xl sm:p-8"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f6ec] sm:mb-5 sm:h-14 sm:w-14">
                  <Icon className="text-[#00b14f]" size={22} aria-hidden />
                </div>

                <h3 className="mb-1.5 text-sm font-semibold text-slate-800 sm:mb-2 sm:text-base">
                  {item.title}
                </h3>

                <p className="line-clamp-3 text-xs leading-relaxed text-slate-500 sm:line-clamp-none sm:text-sm">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
