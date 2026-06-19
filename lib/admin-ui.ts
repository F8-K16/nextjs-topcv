import { cn } from "@/lib/utils";

export const ADMIN_ADD_NEW_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-900/20 transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-violet-900/30";

export const ADMIN_NATIVE_SELECT =
  "rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-violet-500/50 dark:[color-scheme:dark]";

export const ADMIN_NATIVE_OPTION =
  "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100";

export const ADMIN_MODAL_SELECT =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-violet-500/50 dark:[color-scheme:dark]";

export const ADMIN_FILTER_GRID =
  "grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export const ADMIN_FILTER_FIELD = "flex min-w-0 flex-col gap-1";

export const ADMIN_FILTER_LABEL =
  "text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-500";

export const ADMIN_FILTER_SELECT_WIDE = `${ADMIN_NATIVE_SELECT} w-full min-w-[11rem]`;

export const adminSurfaceCard =
  "rounded-2xl border border-zinc-200/90 bg-white shadow-sm shadow-zinc-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-xl dark:shadow-black/20";

export const adminSurfaceCardBlur = cn(adminSurfaceCard, "backdrop-blur-md");

export const adminDialogSurface =
  "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-[#1e1e1e] dark:text-white";

export const adminPageTitle =
  "text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white";

export const adminSectionTitle =
  "text-sm font-semibold text-zinc-900 dark:text-white";

export const adminLead = "text-sm text-zinc-600 dark:text-zinc-400";

export const adminLabel =
  "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export const adminInput =
  "w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/25 dark:border-white/10 dark:bg-[#2f2f2f] dark:text-white dark:placeholder:text-zinc-500";

export const adminInputCompact =
  "w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-violet-500/40";

export const adminBorderSubtle = "border-zinc-200 dark:border-white/10";

export const adminSearchField =
  "rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-violet-500/50";

export const adminSearchFieldWide = cn("w-full max-w-sm", adminSearchField);
export const adminSearchFieldGrow = cn("min-w-0 flex-1", adminSearchField);

export const adminSearchFieldWithIcon = cn(
  adminSearchField,
  "w-full py-2.5 pl-12 pr-3",
);

export const adminSearchFieldWithIcon9 = cn(
  adminSearchField,
  "w-full py-2.5 pl-11 pr-3",
);

export const adminTableDivide = "divide-y divide-zinc-200 dark:divide-white/10";
export const adminTableHeadRow =
  "text-left text-xs font-semibold text-zinc-500 dark:text-white/60";
export const adminTableMuted = "text-sm text-zinc-600 dark:text-white/70";
export const adminTableEmptyCell =
  "px-3 py-8 text-center text-sm text-zinc-500 dark:text-white/60";
export const adminCardTitle =
  "text-lg font-semibold text-zinc-900 dark:text-white";
export const adminCardSubtitle = "text-sm text-zinc-600 dark:text-white/60";
export const adminRowSelected = "bg-violet-50/90 dark:bg-white/[0.06]";

export const adminKebabButton =
  "rounded-lg border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white";

export const adminDropdownPanel =
  "absolute right-0 z-20 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 text-left shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95";

export const adminDropdownItem =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10";

export const adminModerationPanel =
  "scroll-mt-28 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm ring-1 ring-zinc-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-xl dark:shadow-black/30 dark:backdrop-blur-md";

export const adminModerationListItem =
  "rounded-xl border border-zinc-200 bg-zinc-50/90 px-3 py-2.5 dark:border-white/10 dark:bg-black/25";

export const adminModerationHeading =
  "text-sm font-semibold text-zinc-900 dark:text-white";

export const adminModerationCountChip =
  "ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200";

export const adminModerationTableShell =
  "overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10";

export const adminModerationThead =
  "sticky top-0 z-[1] border-b border-zinc-200 bg-zinc-100/95 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/90";

export const adminModerationTh =
  "whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-500";

export const adminModerationTr =
  "border-b border-zinc-100 bg-white transition-colors hover:bg-zinc-50 dark:border-white/[0.06] dark:bg-black/20 dark:hover:bg-white/[0.04]";

export const adminModerationBtnGhost =
  "rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:shadow-none dark:hover:bg-white/10";

export const adminModerationBtnApprove =
  "rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20";

export const adminModerationBtnReject =
  "rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20";
