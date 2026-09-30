"use client";

import { logoutAction } from "@/app/actions/auth.action";
import { useAuthStore } from "@/app/stores/auth.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHeaderDropdownStore } from "@/app/stores/header-dropdown.store";
import UserAvatar from "./UserAvatar";
import UserChatInbox from "./UserChatInbox";
import {
  ChevronDown,
  LogOut,
  Bookmark,
  FileText,
  UserRound,
  Loader2,
  ClipboardList,
  Briefcase,
  Building2,
  Sparkles,
  Compass,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function UserProfile() {
  const { user, isAuthenticated, loadingAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const registerCloseProfileMenu = useHeaderDropdownStore(
    (s) => s.registerCloseProfileMenu,
  );
  const closeHeaderDropdowns = useHeaderDropdownStore((s) => s.close);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  useEffect(() => {
    registerCloseProfileMenu(() => setMenuOpen(false));
    return () => registerCloseProfileMenu(() => {});
  }, [registerCloseProfileMenu]);

  const handleLogout = async () => {
    setMenuOpen(false);
    const res = await logoutAction();
    if (res?.success === false) {
      toast.error(res.message || "Đăng xuất thất bại");
      return;
    }
    clearAuth();
    toast.success("Đăng xuất thành công");
    router.push("/auth/login");
  };

  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const isEmployer = Boolean(user?.roles?.includes("EMPLOYER"));
  const isAdmin =
    user?.roles?.some((r) => ["ADMIN", "MODERATOR", "SUPPORT"].includes(r)) ??
    false;

  if (loadingAuth) {
    return (
      <div className="flex h-10 w-10 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  const showChatInbox = isEmployer || isCandidate;

  return (
    <div className="flex items-center gap-2 overflow-visible sm:gap-3">
      {isAuthenticated ? (
        <>
          {showChatInbox ? <UserChatInbox /> : null}
          <div className="relative" ref={wrapRef}>
            <button
              type="button"
              onClick={() =>
                setMenuOpen((o) => {
                  const next = !o;
                  if (next) closeHeaderDropdowns();
                  return next;
                })
              }
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-full border border-gray-200/80 bg-white py-1 pl-1 pr-2 shadow-sm transition hover:border-[#00b14f]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00b14f]/50 dark:border-white/15 dark:bg-white/5"
            >
              <UserAvatar
                avatar={user?.avatar}
                username={user?.username}
                size={36}
              />
              <span className="hidden max-w-30 truncate text-left text-sm font-semibold text-gray-800 sm:inline dark:text-zinc-100">
                {user?.username}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gray-500 transition dark:text-zinc-400 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/60 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/40">
                  <div className="bg-linear-to-br from-[#00b14f] to-emerald-700 px-4 py-4 text-white">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatar={user?.avatar}
                        username={user?.username}
                        size={48}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold leading-tight">
                          {user?.username}
                        </p>
                        <p className="truncate text-xs text-white/85">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <nav className="p-2">
                    {isCandidate && !isAdmin && !isEmployer ? (
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                      >
                        <UserRound className="h-4 w-4 text-[#00b14f]" />
                        Tài khoản &amp; bảo mật
                      </Link>
                    ) : null}
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                      >
                        <Shield className="h-4 w-4 text-[#00b14f]" />
                        Quản trị
                      </Link>
                    ) : null}
                    {isEmployer ? (
                      <Link
                        href="/employer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                      >
                        <Briefcase className="h-4 w-4 text-[#00b14f]" />
                        Khu vực nhà tuyển dụng
                      </Link>
                    ) : null}
                    {isCandidate ? (
                      <>
                        <Link
                          href="/resumes"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                        >
                          <FileText className="h-4 w-4 text-[#00b14f]" />
                          Quản lý CV
                        </Link>

                        <Link
                          href="/saved-jobs"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                        >
                          <Bookmark className="h-4 w-4 text-[#00b14f]" />
                          Việc đã lưu
                        </Link>
                        <Link
                          href="/followed-companies"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                        >
                          <Building2 className="h-4 w-4 text-[#00b14f]" />
                          Công ty đã theo dõi
                        </Link>
                        <Link
                          href="/applied-jobs"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                        >
                          <ClipboardList className="h-4 w-4 text-[#00b14f]" />
                          Việc đã ứng tuyển
                        </Link>
                        <Link
                          href="/profile/recommendations"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                        >
                          <Sparkles className="h-4 w-4 text-[#00b14f]" />
                          Sở thích gợi ý việc làm
                        </Link>
                        <Link
                          href="/jobs/recommended"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/10"
                        >
                          <Compass className="h-4 w-4 text-[#00b14f]" />
                          Gợi ý việc làm
                        </Link>
                      </>
                    ) : null}
                  </nav>

                  <div className="border-t border-gray-100 p-2 dark:border-white/10">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <Link
            href="/auth/sign-up"
            className="flex min-h-9 items-center justify-center rounded-full border border-[#00b14f] px-3 text-xs font-semibold text-[#00b14f] transition hover:bg-emerald-50 sm:min-h-10 sm:px-4 sm:text-sm dark:hover:bg-emerald-500/10"
          >
            Đăng ký
          </Link>
          <Link
            href="/auth/login"
            className="flex min-h-9 items-center justify-center rounded-full bg-[#00b14f] px-3 text-xs font-semibold text-white transition hover:bg-[#009944] sm:min-h-10 sm:px-4 sm:text-sm"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/sign-up/employer"
            className="flex min-h-9 items-center justify-center rounded-full border border-[#00b14f] bg-white px-3 text-xs font-semibold text-[#00b14f] transition hover:bg-emerald-50 sm:min-h-10 sm:px-4 sm:text-sm dark:bg-transparent dark:hover:bg-emerald-500/10"
          >
            Đăng tuyển & tìm hồ sơ
          </Link>
        </>
      )}
    </div>
  );
}
