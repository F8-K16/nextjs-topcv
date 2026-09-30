import { Inter } from "next/font/google";
import type { Metadata } from "next";
import AppToaster from "@/components/app-toaster";

import "./globals.css";
import Providers from "./contexts/Providers";
import { AppInitializer } from "./contexts/AppInitializer";
import { rootMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = rootMetadata;

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.className} suppressHydrationWarning>
      <body>
        <AppInitializer />
        <Providers>{children}</Providers>
        <AppToaster />
      </body>
    </html>
  );
}
