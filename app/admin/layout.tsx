import type { Metadata } from "next";

import AdminShell from "./components/AdminShell";
import AdminGuard from "./AdminGuard";
import AdminThemeProvider from "./components/AdminThemeProvider";
import { adminLayoutMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = adminLayoutMetadata;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminGuard>
        <AdminShell>{children}</AdminShell>
      </AdminGuard>
    </AdminThemeProvider>
  );
}
