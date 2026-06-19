import type { Metadata } from "next";

import EmployerGuard from "./EmployerGuard";
import EmployerShell from "./EmployerShell";
import { employerLayoutMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = employerLayoutMetadata;

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployerGuard>
      <EmployerShell>{children}</EmployerShell>
    </EmployerGuard>
  );
}
