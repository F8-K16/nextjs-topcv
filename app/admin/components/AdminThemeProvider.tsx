"use client";

import { useEffect } from "react";

import { ThemeProvider } from "@/components/theme-provider";

function AdminThemeCleanup() {
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

export default function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="jp-admin-theme"
    >
      <AdminThemeCleanup />
      {children}
    </ThemeProvider>
  );
}
