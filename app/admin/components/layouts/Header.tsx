"use client";

import { LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { logoutAction } from "@/app/actions/auth.action";
import { useAuthStore } from "@/app/stores/auth.store";
import UserAvatar from "@/app/(main)/components/UserAvatar";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import NotificationBellDropdown from "@/components/NotificationBellDropdown";
import { getAdminPageTitle } from "@/lib/admin-nav";

export default function Header({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loadingAuth, isAuthenticated, clearAuth } = useAuthStore();
  const pageTitle = getAdminPageTitle(pathname);

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res && res.success === false) {
      toast.error(
        (res as { message?: string }).message || "Đăng xuất thất bại",
      );
      return;
    }
    clearAuth();
    toast.success("Đăng xuất thành công");
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
      <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-2.5 sm:px-5 sm:py-3 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {onOpenMobileMenu ? (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="inline-flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-zinc-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/15 dark:hover:text-violet-200"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : null}
          <div className="min-w-0">
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 sm:block">
              Admin
            </p>
            <h1 className="min-w-0 truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AdminThemeToggle />

          <NotificationBellDropdown
            variant="admin"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            iconClassName="h-[18px] w-[18px]"
          />

          {loadingAuth ? (
            <span className="text-xs text-zinc-500">Đang tải…</span>
          ) : isAuthenticated && user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-zinc-200/90 bg-white py-0.5 pr-2.5 pl-0.5 dark:border-white/10 dark:bg-white/5 md:flex">
                <UserAvatar
                  avatar={user.avatar}
                  username={user.username}
                  size={26}
                />
                <span className="max-w-36 truncate text-[12px] font-medium text-zinc-700 dark:text-zinc-200 lg:max-w-44">
                  {user.username}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex h-9 shrink-0 touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-[12px] font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
