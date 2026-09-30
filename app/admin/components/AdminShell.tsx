"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Header from "./layouts/Header";
import ModalManager from "./ModalManager";
import Sidebar from "./layouts/Sidebar";

const SIDEBAR_EXPANDED_KEY = "jp-admin-sidebar-expanded";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLgUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_EXPANDED_KEY) === "0") {
        setDesktopExpanded(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (isLgUp) queueMicrotask(() => setMobileOpen(false));
  }, [isLgUp]);

  const persistDesktopExpanded = (next: boolean) => {
    setDesktopExpanded(next);
    try {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const handleHeaderMenu = () => {
    setMobileOpen(true);
  };

  return (
    <div className="admin-app min-h-screen bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.08),_transparent_42%),linear-gradient(to_bottom_right,#fafafa,#ffffff,#f4f4f5)] text-[13px] leading-5 text-zinc-900 dark:bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.12),_transparent_40%),linear-gradient(to_bottom,#09090b,#0a0a0c_55%,#000)] dark:text-zinc-50">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng menu điều hướng"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-col lg:flex-row lg:items-start">
        <Sidebar
          mobileOpen={mobileOpen}
          desktopExpanded={desktopExpanded}
          onMobileClose={() => setMobileOpen(false)}
          onDesktopExpandedChange={persistDesktopExpanded}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header onOpenMobileMenu={handleHeaderMenu} />
          <ModalManager>
            <main className="min-w-0 text-zinc-800 dark:text-zinc-100">
              <div className="mx-auto w-full px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:pb-10 lg:pt-6">
                {children}
              </div>
            </main>
          </ModalManager>
        </div>
      </div>
    </div>
  );
}
