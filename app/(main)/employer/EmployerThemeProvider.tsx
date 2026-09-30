"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ThemeProvider } from "@/components/theme-provider";

function EmployerThemeCleanup() {
  useEffect(() => {
    return () => {
      if (typeof document === "undefined") return;
      const html = document.documentElement;
      html.classList.remove("dark");
      html.style.colorScheme = "";
    };
  }, []);

  return null;
}

export default function EmployerThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const enabled = pathname.startsWith("/employer");

  if (!enabled) return children;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="jp-employer-theme"
    >
      <EmployerThemeCleanup />
      {children}
    </ThemeProvider>
  );
}
