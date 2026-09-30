"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import logo from "../../../public/images/logo.jpg";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRBAC } from "@/hooks/useRBAC";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 170;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * logo.height) / logo.width);

const baseItems = [
  { href: "/jobs", label: "Việc làm" },
  { href: "/companies", label: "Công ty" },
  { href: "/cv/templates", label: "Tạo CV" },
  { href: "/blog", label: "Cẩm nang nghề nghiệp" },
];

function linkActive(pathname: string, href: string) {
  if (href === "/cv/templates" && pathname.startsWith("/cv")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const pathname = usePathname();
  const { is, can } = useRBAC();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showCvLink = can("resumes:own");

  const items = useMemo(() => {
    if (showCvLink) return baseItems;
    return baseItems.filter((i) => !i.href.startsWith("/cv"));
  }, [showCvLink]);

  return (
    <nav className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:justify-start lg:gap-8">
      <Link
        href="/"
        className="shrink-0 text-primary lg:-my-3 lg:flex lg:items-center"
        onClick={() => setMobileOpen(false)}
      >
        <Image
          src={logo}
          alt="TopCV"
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority
          className="block h-8 w-auto max-w-[min(42vw,170px)] sm:h-9 md:h-10 lg:h-18 lg:max-w-none dark:hidden"
        />
        <Image
          src="/images/logo-dark.png"
          alt=""
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          className="hidden h-8 w-auto max-w-[min(42vw,170px)] object-contain sm:h-9 md:h-10 lg:h-14 lg:max-w-none dark:block"
          aria-hidden
        />
      </Link>

      <ul className="hidden min-w-0 items-center gap-7 text-[15px] font-medium text-[#263a4d] lg:flex dark:text-zinc-200">
        {items.map((item) => {
          const active = linkActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-1 transition hover:text-primary ${active ? "text-primary" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/coming-soon"
            className={`flex items-center gap-2 font-semibold transition hover:text-primary ${
              pathname === "/coming-soon" ? "text-primary" : ""
            }`}
          >
            TopCV{" "}
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              Pro
            </span>
          </Link>
        </li>
        {/* Employer / Admin quick links */}
        {is.employer && (
          <li>
            <Link
              href="/employer"
              className={`flex items-center gap-1 font-semibold transition hover:text-primary ${pathname.startsWith("/employer") ? "text-primary" : ""}`}
            >
              Nhà tuyển dụng
            </Link>
          </li>
        )}
        {is.admin && (
          <li>
            <Link
              href="/admin"
              className="flex items-center gap-1 font-semibold text-violet-700 transition hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200"
            >
              Admin
            </Link>
          </li>
        )}
      </ul>

      <div className="shrink-0 lg:hidden">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm transition hover:border-primary/40 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </DialogTrigger>
          <DialogContent
            showCloseButton
            className={cn(
              "fixed top-0 right-0 bottom-0 left-auto h-full max-h-none w-[min(100%,20rem)] max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-y-0 border-r-0 p-0 sm:rounded-none",
              "flex flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100",
            )}
          >
            <DialogHeader className="border-b border-zinc-100 px-4 py-4 text-left dark:border-white/10">
              <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Menu
              </DialogTitle>
            </DialogHeader>
            <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
              {items.map((item) => {
                const active = linkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-3 text-[15px] font-medium transition",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/10",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/coming-soon"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "mt-1 flex items-center gap-2 rounded-xl px-3 py-3 text-[15px] font-semibold transition",
                  pathname === "/coming-soon"
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/10",
                )}
              >
                TopCV
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                  Pro
                </span>
              </Link>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
