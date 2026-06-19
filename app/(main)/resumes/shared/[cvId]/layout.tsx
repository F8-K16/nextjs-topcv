import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV được chia sẻ",
  description: "Xem CV công khai được chia sẻ qua liên kết.",
};

export default function SharedCvLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
