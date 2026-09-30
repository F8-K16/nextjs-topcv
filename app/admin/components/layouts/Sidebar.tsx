"use client";
import {
  BriefcaseBusiness,
  ClipboardList,
  House,
  FileUser,
  LayoutTemplate,
  ChevronsLeft,
  ChevronsRight,
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
  UserRound,
  Newspaper,
  Mail,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/app/stores/auth.store";
import {
  ADMIN_NAV_GROUP_ORDER,
  ADMIN_NAV_ITEMS,
} from "@/lib/admin-nav";
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
  UserRound,
  Newspaper,
  Mail,
};

export default function Sidebar({
  mobileOpen,
  desktopExpanded,
  onMobileClose,
  onDesktopExpandedChange,
}: {
  mobileOpen: boolean;
  desktopExpanded: boolean;
  onMobileClose: () => void;
  onDesktopExpandedChange: (expanded: boolean) => void;
}) {
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

  const visibleItems = ADMIN_NAV_ITEMS.filter((item) => {
    if (isAdmin) return true;
    if (!("permission" in item) || !item.permission) return true;
    return perms.includes(item.permission);
  });

  const grouped = useMemo(() => {
    return ADMIN_NAV_GROUP_ORDER.map((label) => ({
      label,
      items: visibleItems.filter((item) => item.group === label),
    })).filter((g) => g.items.length > 0);
  }, [visibleItems]);

  const showLabels = !isLg || desktopExpanded;

  const handlePrimaryToggle = () => {
    if (!isLg) {
      onMobileClose();
      return;
    }
    onDesktopExpandedChange(!desktopExpanded);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col overflow-visible border-r border-zinc-200/80 bg-white/95 backdrop-blur-md transition-[transform,width] duration-320 ease-[cubic-bezier(0.33,1,0.32,1)] motion-reduce:transition-none motion-reduce:duration-0 lg:backdrop-blur-none dark:border-white/10 dark:bg-zinc-950",
        "w-64 -translate-x-full lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:self-start",
        mobileOpen && "translate-x-0",
        desktopExpanded ? "lg:w-60" : "lg:w-[4.5rem]",
      )}
    >
      <div className="relative flex h-full min-h-0 flex-col px-3 py-3 sm:px-3.5">
        <div className="relative flex min-h-11 shrink-0 items-center justify-center">
          {!isLg ? (
            <button
              type="button"
              onClick={handlePrimaryToggle}
              className="absolute left-0 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-200/90 bg-zinc-50 text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/15 dark:hover:text-violet-200"
              aria-label="Đóng menu"
            >
              <X size={16} strokeWidth={2.25} />
            </button>
          ) : null}

          <Link
            href="/admin"
            className="flex items-center justify-center"
            aria-label="TopCV Admin"
            onClick={() => {
              if (!isLg) onMobileClose();
            }}
          >
            {showLabels ? (
              <>
                <Image
                  src="/images/logo-default.png"
                  alt="TopCV"
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  className="block h-8 w-auto max-w-full object-contain dark:hidden sm:h-9"
                />
                <Image
                  src="/images/logo-dark.png"
                  alt=""
                  width={LOGO_WIDTH}
                  height={LOGO_HEIGHT}
                  className="hidden h-8 w-auto max-w-full object-contain dark:block sm:h-8"
                  aria-hidden
                />
              </>
            ) : (
              <>
                <Image
                  src="/images/logo-default.png"
                  alt="TopCV"
                  width={40}
                  height={40}
                  className="block h-9 w-9 rounded-lg object-cover object-[28%_center] ring-1 ring-zinc-200/80 dark:hidden"
                />
                <Image
                  src="/images/logo-dark.png"
                  alt=""
                  width={40}
                  height={40}
                  className="hidden h-9 w-9 rounded-lg object-cover object-[28%_center] ring-1 ring-white/15 dark:block"
                  aria-hidden
                />
              </>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => onDesktopExpandedChange(!desktopExpanded)}
          className="absolute top-[3.1rem] -right-3 z-20 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 lg:inline-flex dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-violet-400/50 dark:hover:bg-violet-500/20 dark:hover:text-violet-200"
          aria-label={desktopExpanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
        >
          {desktopExpanded ? (
            <ChevronsLeft size={13} strokeWidth={2.4} />
          ) : (
            <ChevronsRight size={13} strokeWidth={2.4} />
          )}
        </button>

        <nav className="admin-sidebar-scroll mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-3">
          {grouped.map((group, gi) => (
            <div
              key={group.label}
              className={cn(gi > 0 && "mt-3 border-t border-zinc-100 pt-3 dark:border-white/10")}
            >
              {showLabels ? (
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                  {group.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const IconComponent = ICONS[item.icon];
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
                        "group relative flex touch-manipulation items-center rounded-lg px-2.5 py-2 text-[13px] font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
                        !showLabels && "lg:justify-center lg:px-2",
                        isActive &&
                          "bg-violet-50 text-violet-800 hover:bg-violet-50 hover:text-violet-800 dark:bg-violet-500/15 dark:text-violet-100 dark:hover:bg-violet-500/15 dark:hover:text-violet-100",
                      )}
                    >
                      {isActive ? (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-violet-600 dark:bg-violet-400" />
                      ) : null}
                      {IconComponent ? (
                        <span
                          className={cn(
                            "flex shrink-0",
                            !showLabels && "lg:mx-auto",
                            isActive
                              ? "text-violet-600 dark:text-violet-300"
                              : "text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-200",
                          )}
                        >
                          <IconComponent size={18} strokeWidth={1.9} />
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "min-w-0 truncate whitespace-nowrap",
                          SIDEBAR_CONTENT_TRANSITION,
                          showLabels
                            ? "ml-2.5 max-w-56 opacity-100"
                            : "ml-0 max-w-0 overflow-hidden opacity-0 lg:ml-0",
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
