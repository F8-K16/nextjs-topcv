"use client";
import {
  BriefcaseBusiness,
  ClipboardList,
  House,
  FileUser,
  LayoutTemplate,
  Menu,
  Building2,
  Users,
  ChartBarStacked,
  Tags,
  Settings,
  Bell,
  MapPin,
  Gavel,
  ScrollText,
  ShieldCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/stores/auth.store";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 110;
const LOGO_HEIGHT = 48;


const SIDEBAR_CONTENT_TRANSITION =
  "transition-[max-width,opacity,margin] duration-[320ms] ease-[cubic-bezier(0.33,1,0.32,1)] motion-reduce:transition-none motion-reduce:duration-0";

const ICONS = {
  House,
  BriefcaseBusiness,
  ChartBarStacked,
  Building2,
  FileUser,
  LayoutTemplate,
  Users,
  ClipboardList,
  Tags,
  Settings,
  Bell,
  MapPin,
  Gavel,
  ScrollText,
  ShieldCheck,
};

const sidebarItems: Array<{
  name: string;
  href: string;
  icon: keyof typeof ICONS;
  permission?: string;
}> = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: "House",
    permission: "admin:dashboard:read",
  },
  { name: "Thông báo", href: "/admin/notifications", icon: "Bell" },
  {
    name: "Người dùng",
    href: "/admin/users",
    icon: "Users",
    permission: "admin:users:read",
  },
  {
    name: "Danh mục",
    href: "/admin/categories",
    icon: "ChartBarStacked",
    permission: "admin:categories:read",
  },
  {
    name: "Công ty",
    href: "/admin/companies",
    icon: "Building2",
    permission: "admin:companies:read",
  },
  {
    name: "Việc làm",
    href: "/admin/jobs",
    icon: "BriefcaseBusiness",
    permission: "admin:jobs:read",
  },
  {
    name: "Kiểm duyệt",
    href: "/admin/moderation",
    icon: "Gavel",
    permission: "admin:moderation:read",
  },
  {
    name: "Hoạt động",
    href: "/admin/audit-logs",
    icon: "ScrollText",
    permission: "admin:audit_logs:read",
  },
  {
    name: "Ứng tuyển",
    href: "/admin/applications",
    icon: "ClipboardList",
    permission: "admin:applications:read",
  },
  {
    name: "CV ứng viên",
    href: "/admin/resumes",
    icon: "FileUser",
    permission: "admin:resumes:read",
  },
  {
    name: "Mẫu CV",
    href: "/admin/cv-templates",
    icon: "LayoutTemplate",
    permission: "admin:cv_templates:read",
  },
  {
    name: "Kỹ năng",
    href: "/admin/skills",
    icon: "Tags",
    permission: "admin:skills:read",
  },
  {
    name: "Địa lý",
    href: "/admin/locations",
    icon: "MapPin",
    permission: "admin:locations:read",
  },
  {
    name: "Phân quyền",
    href: "/admin/access-control",
    icon: "ShieldCheck",
    permission: "admin:access_control:read",
  },
  {
    name: "Cài đặt",
    href: "/admin/settings",
    icon: "Settings",
    permission: "admin:settings:read",
  },
];

export default function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [isLg, setIsLg] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  const perms = user?.permissions ?? [];

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const visibleItems = sidebarItems.filter((item) => {
    if (isAdmin) return true;
    if (!item.permission) return true;
    return perms.includes(item.permission);
  });

  const showLabels = !isLg || desktopExpanded;

  const handlePrimaryToggle = () => {
    if (!isLg) {
      onMobileClose();
      return;
    }
    setDesktopExpanded((v) => !v);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col overflow-hidden border-r border-zinc-200/90 bg-white/95 shadow-[4px_0_24px_rgba(0,0,0,0.06)] backdrop-blur-md transition-[transform,width] duration-320 ease-[cubic-bezier(0.33,1,0.32,1)] motion-reduce:transition-none motion-reduce:duration-0 lg:backdrop-blur-none dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)]",
        "w-64 -translate-x-full lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:self-start",
        mobileOpen && "translate-x-0",
        desktopExpanded ? "lg:w-64" : "lg:w-20",
      )}
    >
      <div className="flex h-full min-h-0 flex-col p-3 sm:p-4">
        <div className="flex min-h-10 shrink-0 flex-nowrap items-center gap-2 sm:min-h-11">
          <button
            type="button"
            onClick={handlePrimaryToggle}
            className="touch-manipulation shrink-0 cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-zinc-200 dark:hover:bg-[#2f2f2f]"
            aria-label={
              !isLg
                ? "Đóng menu"
                : desktopExpanded
                  ? "Thu gọn sidebar"
                  : "Mở rộng sidebar"
            }
          >
            {!isLg && mobileOpen ? (
              <X size={22} className="text-zinc-800 dark:text-white" />
            ) : (
              <Menu size={22} className="text-zinc-800 dark:text-white" />
            )}
          </button>
          <div
            className={cn(
              "relative min-w-0 flex-1 overflow-hidden transition-[max-width,opacity] duration-320 ease-[cubic-bezier(0.33,1,0.32,1)] motion-reduce:transition-none motion-reduce:duration-0",
              showLabels ? "max-w-50 opacity-100" : "max-w-0 opacity-0",
            )}
            aria-hidden={!showLabels}
          >
            <div className="flex min-h-10 items-center sm:min-h-11">
              <Image
                src="/images/logo-default.png"
                alt="TopCV"
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                className="block h-8 w-auto max-w-full object-contain object-left dark:hidden sm:h-12"
              />
              <Image
                src="/images/logo-dark.png"
                alt=""
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                className="hidden h-8 w-auto max-w-full object-contain object-left dark:block sm:h-9"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <nav className="custom-scrollbar mt-6 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden pb-2">
          {visibleItems.map((item) => {
            const IconComponent = ICONS[item.icon as keyof typeof ICONS];
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (!isLg) onMobileClose();
                }}
                className={cn(
                  "flex touch-manipulation items-center rounded-xl p-3 text-sm font-medium text-zinc-800 transition-[background-color,box-shadow] duration-200 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10 lg:p-4",
                  !showLabels && "lg:justify-center lg:px-2",
                  isActive &&
                    "bg-zinc-200/80 text-zinc-950 shadow-inner ring-1 ring-zinc-300/80 dark:bg-white/10 dark:text-white dark:ring-white/15",
                )}
              >
                {IconComponent && (
                  <span
                    className={cn("flex shrink-0", !showLabels && "lg:mx-auto")}
                  >
                    <IconComponent size={20} />
                  </span>
                )}
                <span
                  className={cn(
                    "min-w-0 truncate whitespace-nowrap",
                    SIDEBAR_CONTENT_TRANSITION,
                    showLabels
                      ? "ml-3 max-w-56 opacity-100 lg:ml-4"
                      : "ml-0 max-w-0 overflow-hidden opacity-0 lg:ml-0",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
