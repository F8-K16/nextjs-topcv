"use client";
import Image from "next/image";
import vi from "../../../../public/images/vi.png";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logoutAction } from "@/app/actions/auth.action";
import { useAuthStore } from "@/app/stores/auth.store";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import NotificationBellDropdown from "@/components/NotificationBellDropdown";

export default function Header({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu?: () => void;
}) {
  const router = useRouter();
  const { user, loadingAuth, isAuthenticated, clearAuth } = useAuthStore();

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
    <header className="sticky top-0 z-30 mx-3 mb-3 mt-3 w-auto max-w-none rounded-2xl border border-zinc-200/90 bg-white/90 px-3 shadow-lg shadow-zinc-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 dark:shadow-black/30 sm:mx-4 sm:mb-4 sm:mt-4 sm:px-5 lg:mx-6 lg:px-6">
      <div className="flex min-w-0 items-center justify-between gap-2 py-3 sm:gap-3 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onOpenMobileMenu ? (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="touch-manipulation shrink-0 rounded-xl p-2 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10 lg:hidden"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>
          ) : null}
          <h1 className="min-w-0 truncate text-base font-semibold text-zinc-900 dark:text-white sm:text-lg lg:text-xl xl:text-2xl">
            Bảng điều khiển
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-3">
          <Image
            src={vi}
            alt=""
            width={25}
            height={20}
            className="hidden rounded-full shadow-md sm:block cursor-pointer"
          />

          <AdminThemeToggle />

          <NotificationBellDropdown
            variant="admin"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:h-10 sm:w-10"
            iconClassName="h-5 w-5 sm:h-6 sm:w-6"
          />

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            {loadingAuth ? (
              <span className="font-semibold text-white">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <span className="hidden max-w-40 truncate text-sm font-medium text-zinc-700 dark:text-gray-100 md:block lg:max-w-xs xl:max-w-none">
                  Xin chào: {user!.username}
                </span>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="inline-flex shrink-0 touch-manipulation items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10 sm:gap-1.5 sm:px-3"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
