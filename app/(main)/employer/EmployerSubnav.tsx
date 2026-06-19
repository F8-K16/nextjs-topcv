"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  Home,
  IdCard,
  LayoutDashboard,
  Menu,
  UserPlus,
  UserSearch,
  X,
} from "lucide-react";
import Image from "next/image";

const L_OVERVIEW = "Tổng quan";
const L_COMPANY = "Hồ sơ công ty";

const L_JOBS = "Tin tuyển dụng";
const L_APPS = "Hồ sơ ứng tuyển";
const L_MEMBERS = "Thành viên";
const L_HOME = "Về trang chủ";
const L_MENU = "Mục lục";

const links = [
  { href: "/employer", label: L_OVERVIEW, icon: LayoutDashboard },
  { href: "/employer/company", label: L_COMPANY, icon: IdCard },
  { href: "/employer/jobs", label: L_JOBS, icon: Briefcase },
  { href: "/employer/members", label: L_MEMBERS, icon: UserPlus },
  { href: "/employer/applications", label: L_APPS, icon: ClipboardList },
  {
    href: "/employer/suggestions",
    label: "Gợi ý ứng viên",
    icon: UserSearch,
  },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/employer"
            ? pathname === "/employer"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-primary text-white shadow-sm"
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function CompanyBlock({
  companyName,
  companyLogo,
}: {
  companyName?: string;
  companyLogo?: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <Image
            src={companyLogo || "/images/logo-default.png"}
            alt={companyName!}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {"Đang thao tác"}
          </p>
          <p className="truncate text-sm font-semibold text-zinc-900">
            {companyName || "Nhà tuyển dụng"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EmployerSubnav({
  companyName,
  companyLogo,
}: {
  companyName?: string;
  companyLogo?: string | null;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setDrawerOpen(false));
  }, [pathname]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {companyName || "Nhà tuyển dụng"}
          </p>
          <p className="text-xs text-zinc-500">{"Khu vực nhà tuyển dụng"}</p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex shrink-0 touch-manipulation items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm"
          aria-expanded={drawerOpen}
          aria-label={L_MENU}
        >
          <Menu className="h-4 w-4" />
          {L_MENU}
        </button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[1px]"
            aria-label={"Đóng"}
            onClick={closeDrawer}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,100vw)] flex-col border-r border-zinc-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-900">
                {L_MENU}
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
                aria-label={"Đóng"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain p-4">
              <CompanyBlock
                companyName={companyName}
                companyLogo={companyLogo}
                onNavigate={closeDrawer}
              />
              <NavLinks pathname={pathname} onNavigate={closeDrawer} />
              <Link
                href="/"
                onClick={closeDrawer}
                className="mt-auto inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-primary"
              >
                <Home className="h-4 w-4" />
                {L_HOME}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:self-start lg:sticky lg:top-18 lg:z-30">
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Home className="h-4 w-4" />
            {L_HOME}
          </Link>
          <CompanyBlock companyName={companyName} companyLogo={companyLogo} />
          <NavLinks pathname={pathname} />
        </div>
      </aside>
    </>
  );
}
