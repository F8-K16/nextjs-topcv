"use client";

import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function CandidateOnlyNotice({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-dashed border-amber-200 bg-amber-50/80 py-16 text-center text-sm text-amber-900 ${className}`}
    >
      {children}
    </div>
  );
}
