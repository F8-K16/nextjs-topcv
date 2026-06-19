"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbDetail } from "@/contexts/BreadcrumbDetailContext";

const SEGMENT_LABELS: Record<string, string> = {
  cv: "Trình tạo CV",
  templates: "Mẫu CV",
  editor: "Chỉnh sửa CV",
  my: "CV đã tạo",
  public: "CV chia sẻ",
  resumes: "Hồ sơ ứng tuyển",
  shared: "CV chia sẻ",
  jobs: "Việc làm",
  recommended: "Việc phù hợp",
  profile: "Tài khoản",
  recommendations: "Sở thích gợi ý",
  password: "Đổi mật khẩu",
  resume: "CV",
  upload: "Tải lên",
  "saved-jobs": "Việc đã lưu",
  "applied-jobs": "Việc đã ứng tuyển",
  "followed-companies": "Công ty đã theo dõi",
  notifications: "Thông báo",
  messages: "Tin nhắn",
  companies: "Công ty",
  employer: "Nhà tuyển dụng",
  applications: "Ứng tuyển",
  company: "Hồ sơ công ty",
  contact: "Liên hệ",
  about: "Giới thiệu",
  blog: "Blog",
  auth: "Tài khoản",
  login: "Đăng nhập",
  "sign-up": "Đăng ký",
  "forgot-password": "Quên mật khẩu",
  "reset-password": "Đặt lại mật khẩu",
  "verify-email": "Xác thực email",
  "pending-approval": "Chờ duyệt",
};

function segmentLabel(segment: string, segments: string[], index: number) {
  if (segment === "employer" && segments.length === 1) {
    return "Tổng quan";
  }
  const parent = index > 0 ? segments[index - 1] : "";
  if (parent === "employer") {
    if (segment === "jobs") return "Tin tuyển dụng";
    if (segment === "applications") return "Ứng viên";
    if (segment === "suggestions") return "Gợi ý ứng viên";
    if (segment === "members") return "Thành viên";
  }
  if (parent === "jobs" && segment === "new") {
    return "Đăng tin mới";
  }
  if (parent === "suggestions" && segment === "candidate") {
    return "Hồ sơ CV";
  }
  if (parent === "cv" && segment === "templates") {
    return "Mẫu CV";
  }
  if (parent === "cv" && segment === "my") {
    return "CV đã tạo";
  }
  if (parent === "cv" && segment === "editor") {
    return "Chỉnh sửa CV";
  }
  if (parent === "resumes" && segment === "shared") {
    return "CV chia sẻ";
  }
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (/^\d+$/.test(segment)) {
    if (parent === "jobs") return "Chi tiết tin";
    if (parent === "companies") return "Chi tiết công ty";
    if (parent === "notifications") return "Chi tiết";
    if (parent === "candidate") return "Ứng viên";
    if (parent === "editor") return "Bản CV";
    if (parent === "templates") return "Chi tiết mẫu";
    if (parent === "shared" || parent === "public") return "CV";
    return "Chi tiết";
  }
  return segment;
}

export default function MainBreadcrumb() {
  const pathname = usePathname() || "/";
  const { detailLabel } = useBreadcrumbDetail();
  const segments = pathname.split("/").filter(Boolean);
  const isEmployerArea = pathname.startsWith("/employer");

  if (pathname === "/") {
    return null;
  }

  const tail: { href: string; label: string; current: boolean }[] = [];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    tail.push({
      href: acc,
      label: segmentLabel(seg, segments, i),
      current: isLast,
    });
  });

  return (
    <div className="hidden border-b border-zinc-200/70 bg-white/90 md:block">
      <div
        className={
          isEmployerArea
            ? "mx-auto max-w-full px-4 py-2.5 md:px-6 lg:px-10"
            : "mx-auto max-w-6xl px-4 py-2.5 md:px-6"
        }
      >
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
            <li className="flex min-w-0 items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 leading-5 text-zinc-600 transition hover:text-primary"
              >
                <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Trang chủ
              </Link>
            </li>
            {tail.map((item) => {
              const text =
                item.current && detailLabel ? detailLabel : item.label;
              return (
                <li
                  key={item.href}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                    aria-hidden
                  />
                  {item.current ? (
                    <span
                      className="min-w-0 break-words font-medium leading-5 text-zinc-800"
                      title={text}
                    >
                      {text}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="shrink-0 leading-5 text-zinc-600 transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
