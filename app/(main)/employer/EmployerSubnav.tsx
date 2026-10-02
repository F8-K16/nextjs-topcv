"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Home,
  IdCard,
  LayoutDashboard,
  Menu,
  Plus,
  UserPlus,
  UserRound,
  UserSearch,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const L_HOME = "Về trang chủ";
const L_MENU = "Mục lục";

const groups = [
  {
    label: "Tổng quan",
    items: [
      { href: "/employer", label: "Tổng quan", icon: LayoutDashboard },
      {
        href: "/employer/analytics",
        label: "Phân tích tin",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Công ty",
    items: [
      { href: "/employer/company", label: "Hồ sơ công ty", icon: IdCard },
      {
        href: "/employer/profile",
        label: "Thông tin cá nhân",
        icon: UserRound,
      },
      { href: "/employer/members", label: "Thành viên", icon: UserPlus },
    ],
  },
  {
    label: "Tuyển dụng",
    items: [
      { href: "/employer/jobs", label: "Tin tuyển dụng", icon: Briefcase },
    ],
  },
  {
    label: "Ứng viên",
    items: [
      {
        href: "/employer/applications",
        label: "Hồ sơ ứng tuyển",
        icon: ClipboardList,
      },
      {
        href: "/employer/suggestions",
        label: "Gợi ý ứng viên",
        icon: UserSearch,
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/employer") return pathname === "/employer";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[#00b14f]/10 text-[#087a38] before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-[#00b14f]"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function CompanyBlock({
  companyName,
  companyLogo,
}: {
  companyName?: string;
  companyLogo?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="logo-plate flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <Image
          src={companyLogo || "/images/logo-default.png"}
          alt={companyName || "Công ty"}
          width={64}
          height={64}
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-zinc-900">
          {companyName || "Nhà tuyển dụng"}
        </p>
        <p className="text-xs text-zinc-500">Nhà tuyển dụng</p>
      </div>
    </div>
  );
}

function PostJobButton({
  locked,
  onNavigate,
}: {
  locked?: boolean;
  onNavigate?: () => void;
}) {
  if (locked) {
    return (
      <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-zinc-100 px-3 py-2.5 text-sm font-semibold text-zinc-400">
        <Plus className="h-4 w-4" />
        Đăng tin
      </span>
    );
  }
  return (
    <Link
      href="/employer/jobs/new"
      onClick={onNavigate}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
    >
      <Plus className="h-4 w-4" />
      Đăng tin
    </Link>
  );
}

export default function EmployerSubnav({
  companyName,
  companyLogo,
  companyLocked,
}: {
  companyName?: string;
  companyLogo?: string | null;
  companyLocked?: boolean;
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="logo-plate h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Image
              src={companyLogo || "/images/logo-default.png"}
              alt={companyName || "Công ty"}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="truncate text-sm font-semibold text-zinc-900">
            {companyName || "Nhà tuyển dụng"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[1px]"
            aria-label="Đóng"
            onClick={closeDrawer}
          />
          <div className="employer-app absolute inset-y-0 left-0 flex w-[min(20rem,100vw)] flex-col border-r border-zinc-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-900">
                {L_MENU}
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain p-4">
              <CompanyBlock
                companyName={companyName}
                companyLogo={companyLogo}
              />
              <PostJobButton locked={companyLocked} onNavigate={closeDrawer} />
              <NavLinks pathname={pathname} onNavigate={closeDrawer} />
              <Link
                href="/"
                onClick={closeDrawer}
                className="mt-auto inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                <Home className="h-4 w-4" />
                {L_HOME}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <aside className="sticky top-18 z-30 hidden w-64 shrink-0 self-start lg:block">
        <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <CompanyBlock companyName={companyName} companyLogo={companyLogo} />
          <PostJobButton locked={companyLocked} />
          <NavLinks pathname={pathname} />
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 text-sm font-medium text-zinc-500 hover:text-zinc-800"
          >
            <Home className="h-4 w-4" />
            {L_HOME}
          </Link>
        </div>
      </aside>
    </>
  );
}
