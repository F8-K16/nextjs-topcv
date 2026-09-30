import { cn } from "@/lib/utils";
import {
  adminStatusChip,
  adminStatusDanger,
  adminStatusDot,
  adminStatusInfo,
  adminStatusNeutral,
  adminStatusSuccess,
  adminStatusViolet,
  adminStatusWarning,
} from "@/lib/admin-ui";

const TONE_CLASS = {
  success: adminStatusSuccess,
  warning: adminStatusWarning,
  danger: adminStatusDanger,
  neutral: adminStatusNeutral,
  info: adminStatusInfo,
  violet: adminStatusViolet,
} as const;

const DOT_CLASS = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-zinc-400 dark:bg-zinc-500",
  info: "bg-sky-500",
  violet: "bg-violet-500",
} as const;

export type AdminStatusTone = keyof typeof TONE_CLASS;

export function AdminStatusChip({
  tone,
  children,
  className,
  title,
}: {
  tone: AdminStatusTone;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title ?? (typeof children === "string" ? children : undefined)}
      className={cn(adminStatusChip, TONE_CLASS[tone], className)}
    >
      <span className={cn(adminStatusDot, DOT_CLASS[tone])} aria-hidden />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
