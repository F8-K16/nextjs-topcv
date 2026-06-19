"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Header from "./layouts/Header";
import ModalManager from "./ModalManager";
import Sidebar from "./layouts/Sidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLgUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (isLgUp) queueMicrotask(() => setMobileOpen(false));
  }, [isLgUp]);

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-zinc-950 dark:via-neutral-950 dark:to-black dark:text-zinc-50">
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
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          <ModalManager>
            <main className="min-w-0 text-zinc-800 dark:text-zinc-100">
              <div className="mx-auto w-full px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:pb-10 lg:pt-4">
                {children}
              </div>
            </main>
          </ModalManager>
        </div>
      </div>
    </div>
  );
}
