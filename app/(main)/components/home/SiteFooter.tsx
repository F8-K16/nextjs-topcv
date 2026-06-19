"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { Mail } from "lucide-react";

import { useAuthStore } from "@/app/stores/auth.store";

type FooterLink = { href: string; label: string };
type FooterGroup = { title: string; links: FooterLink[] };

const STAFF_ROLES = new Set(["ADMIN", "MODERATOR", "SUPPORT"]);

function buildFooterGroups(
  isAuthenticated: boolean,
  roles: string[] | undefined,
): FooterGroup[] {
  const r = new Set(roles ?? []);
  const isStaff = [...STAFF_ROLES].some((x) => r.has(x));
  const isEmployer = r.has("EMPLOYER");
  const isCandidate = r.has("CANDIDATE");

  if (!isAuthenticated) {
    return [
      {
        title: "Việc làm",
        links: [
          { href: "/jobs", label: "Tìm việc" },
          { href: "/jobs?jobType=FULL_TIME", label: "Toàn thời gian" },
          { href: "/jobs?jobType=FREELANCE", label: "Freelance" },
          { href: "/companies", label: "Danh sách công ty" },
        ],
      },
      {
        title: "Ứng viên",
        links: [
          { href: "/cv/templates", label: "Tạo CV / mẫu CV" },
          { href: "/auth/sign-up", label: "Đăng ký tài khoản" },
          { href: "/auth/login", label: "Đăng nhập" },
        ],
      },
      {
        title: "Nhà tuyển dụng",
        links: [
          { href: "/auth/sign-up", label: "Đăng ký doanh nghiệp" },
          {
            href: "/auth/login?redirect=/employer",
            label: "Đăng nhập khu vực NTD",
          },
        ],
      },
      {
        title: "Khám phá",
        links: [
          { href: "/blog", label: "Cẩm nang nghề nghiệp" },
          { href: "/about", label: "Về chúng tôi" },
          { href: "/contact", label: "Liên hệ & hỗ trợ" },
        ],
      },
    ];
  }

  const groups: FooterGroup[] = [];

  if (isStaff) {
    groups.push({
      title: "Quản trị",
      links: [
        { href: "/admin", label: "Tổng quan" },
        { href: "/admin/users", label: "Người dùng" },
        { href: "/admin/moderation", label: "Kiểm duyệt" },
        { href: "/admin/jobs", label: "Việc làm (admin)" },
        { href: "/admin/companies", label: "Công ty (admin)" },
      ],
    });
  }

  if (isEmployer) {
    groups.push({
      title: "Nhà tuyển dụng",
      links: [
        { href: "/employer", label: "Trung tâm quản lý" },
        { href: "/employer/jobs/new", label: "Đăng tin tuyển dụng" },
        { href: "/employer/jobs", label: "Tin đã đăng" },
        { href: "/employer/applications", label: "Hồ sơ ứng tuyển" },
        { href: "/employer/company", label: "Hồ sơ công ty" },
        { href: "/employer/members", label: "Thành viên công ty" },
        { href: "/employer/suggestions", label: "Gợi ý ứng viên" },
      ],
    });
  }

  if (isCandidate) {
    groups.push({
      title: "Ứng viên",
      links: [
        { href: "/jobs/recommended", label: "Việc gợi ý cho bạn" },
        { href: "/applied-jobs", label: "Việc đã ứng tuyển" },
        { href: "/saved-jobs", label: "Việc đã lưu" },
        { href: "/cv/templates", label: "Tạo CV" },

        { href: "/resumes", label: "Quản lý CV" },
        { href: "/followed-companies", label: "Công ty đang theo dõi" },
        {
          href: "/profile/recommendations",
          label: "Sở thích & gợi ý việc làm",
        },
      ],
    });
  }

  groups.push({
    title: "Tài khoản & tin nhắn",
    links: [
      { href: "/profile", label: "Hồ sơ cá nhân" },
      { href: "/profile/password", label: "Đổi mật khẩu" },
      { href: "/messages", label: "Tin nhắn" },
      { href: "/notifications", label: "Thông báo" },
    ],
  });

  groups.push({
    title: "Khám phá",
    links: [
      { href: "/jobs", label: "Việc làm" },
      { href: "/companies", label: "Công ty" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "Giới thiệu" },
      { href: "/contact", label: "Hỗ trợ & liên hệ" },
    ],
  });

  return groups;
}

function brandSubtitle(
  isAuthenticated: boolean,
  roles: string[] | undefined,
): string {
  if (!isAuthenticated) {
    return "Nền tảng tuyển dụng hiện đại giúp doanh nghiệp tìm đúng người và ứng viên tìm đúng việc.";
  }
  const list = roles ?? [];
  if ([...STAFF_ROLES].some((x) => list.includes(x))) {
    return "Truy cập nhanh khu vực quản trị và các công cụ hỗ trợ người dùng.";
  }
  if (list.includes("EMPLOYER") && list.includes("CANDIDATE")) {
    return "Quản lý tuyển dụng và hành trình ứng tuyển trên cùng một tài khoản.";
  }
  if (list.includes("EMPLOYER")) {
    return "Đăng tin, quản lý hồ sơ ứng viên và thông tin doanh nghiệp của bạn.";
  }
  if (list.includes("CANDIDATE")) {
    return "Theo dõi việc làm, CV và các tin bạn đã ứng tuyển.";
  }
  return "Nền tảng tuyển dụng hiện đại giúp doanh nghiệp tìm đúng người và ứng viên tìm đúng việc.";
}

export default function SiteFooter() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadingAuth = useAuthStore((s) => s.loadingAuth);

  const groups = useMemo(() => {
    if (loadingAuth) {
      return buildFooterGroups(false, undefined);
    }
    return buildFooterGroups(isAuthenticated, user?.roles);
  }, [isAuthenticated, loadingAuth, user?.roles]);

  const blurb = useMemo(() => {
    if (loadingAuth) {
      return brandSubtitle(false, undefined);
    }
    return brandSubtitle(isAuthenticated, user?.roles);
  }, [isAuthenticated, loadingAuth, user?.roles]);

  const linkGridStyle = {
    "--footer-cols": groups.length,
  } as CSSProperties;

  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-950 text-zinc-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        <div className="flex w-full min-w-0 flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-14">
          <div className="w-full max-w-sm shrink-0 lg:max-w-xs lg:basis-72">
            <p className="text-lg font-bold text-white">
              Top<span className="text-primary">CV</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {blurb}
            </p>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
              <Mail
                className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500"
                aria-hidden
              />
              <span>
                Hỗ trợ:{" "}
                <a
                  href="mailto:support@topcv.local"
                  className="text-zinc-400 underline-offset-2 transition hover:text-primary hover:underline"
                >
                  support@topcv.local
                </a>
              </span>
            </p>
          </div>

          <div
            className="grid w-full min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:gap-x-8 lg:[grid-template-columns:repeat(var(--footer-cols),minmax(0,1fr))]"
            style={linkGridStyle}
          >
            {groups.map((g) => (
              <div key={g.title} className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {g.title}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {g.links.map((l) => (
                    <li key={`${g.title}-${l.href}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="block text-zinc-300 transition hover:text-primary"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex w-full min-w-0 flex-col items-stretch justify-between gap-4 border-t border-zinc-800 pt-8 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p className="text-center sm:flex-1 sm:text-left">
            © {new Date().getFullYear()} TopCV. Bảo lưu mọi quyền.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end sm:shrink-0">
            <Link href="/about" className="hover:text-primary">
              Điều khoản &amp; giới thiệu
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Liên hệ &amp; chính sách hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
