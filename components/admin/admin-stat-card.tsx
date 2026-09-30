"use client";

import { motion, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { adminSurfaceCardBlur } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  accent?: string;
};

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 120, damping: 22, mass: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useMotionValueEvent(spring, "change", (v) => {
    setDisplay(Math.round(v));
  });

  return <span className="tabular-nums">{display.toLocaleString("vi-VN")}</span>;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  accent = "from-violet-500/25 via-fuchsia-500/10 to-transparent",
}: AdminStatCardProps) {
  const inner = (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative overflow-hidden p-4",
        adminSurfaceCardBlur,
      )}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${accent}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            <AnimatedNumber value={value} />
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-violet-50 p-2.5 text-violet-700 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-violet-200">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent opacity-0 transition group-hover:opacity-100 dark:via-white/20" />
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-violet-500/60 rounded-2xl">
        {inner}
      </Link>
    );
  }

  return inner;
}
