import { Suspense } from "react";

import GlobalModal from "./components/modals/GlobalModal";
import ChatBoxWidget from "./components/chat/ChatBoxWidget";
import SiteFooter from "./components/home/SiteFooter";
import Nav from "./components/Nav";
import UserProfile from "./components/UserProfile";
import HeaderActions from "./components/HeaderActions";
import MainBreadcrumb from "./components/MainBreadcrumb";
import { AccessDeniedToast } from "@/app/components/AccessDeniedToast";
import { BreadcrumbDetailProvider } from "@/contexts/BreadcrumbDetailContext";
import HeaderDropdownGroup from "@/contexts/HeaderDropdownGroup";
import EmployerThemeProvider from "./employer/EmployerThemeProvider";

export default function MainLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <EmployerThemeProvider>
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 flex h-18 min-w-0 shrink-0 items-center justify-between gap-2 overflow-visible border-b border-zinc-200/80 bg-white/95 px-3 py-3 backdrop-blur-md sm:gap-3 sm:px-4 md:px-6 md:pr-8 dark:border-white/10 dark:bg-zinc-950/90">
        <Nav />
        <HeaderDropdownGroup>
          <HeaderActions />
          <UserProfile />
        </HeaderDropdownGroup>
      </header>
      <main className="min-w-0 flex-1 overflow-x-clip">
        <BreadcrumbDetailProvider>
          <MainBreadcrumb />
          {children}
        </BreadcrumbDetailProvider>
      </main>
      <SiteFooter />
      <GlobalModal />
      <ChatBoxWidget />
      <Suspense fallback={null}>
        <AccessDeniedToast />
      </Suspense>
    </div>
    </EmployerThemeProvider>
  );
}
