import { cn } from "@/lib/utils";

const ADMIN_CONTROL =
  "h-9 rounded-lg border border-zinc-200 bg-white text-[12px] leading-none text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:shadow-none dark:focus:border-violet-400/40 dark:focus:ring-violet-500/25";

export const ADMIN_ADD_NEW_BUTTON =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[12px] font-medium text-white shadow-sm shadow-violet-900/20 transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-violet-900/30";

export const ADMIN_NATIVE_SELECT = cn(
  ADMIN_CONTROL,
  "min-w-[9rem] cursor-pointer appearance-none bg-no-repeat px-2.5 pr-8 dark:[color-scheme:dark]",
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2371717a%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')] bg-[length:12px_12px] bg-[right_10px_center]",
);

export const ADMIN_NATIVE_OPTION =
  "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100";

export const ADMIN_MODAL_SELECT =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/40 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-violet-500/50 dark:[color-scheme:dark]";

export const ADMIN_FILTER_GRID =
  "grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export const ADMIN_FILTER_FIELD = "flex min-w-0 flex-col gap-1";

export const ADMIN_FILTER_LABEL =
  "text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500";

export const ADMIN_FILTER_SELECT_WIDE = cn(ADMIN_NATIVE_SELECT, "w-full min-w-0");

export const ADMIN_TOOLBAR =
  "flex w-full min-w-0 flex-wrap items-center gap-2";

export const ADMIN_TOOLBAR_SHELL =
  "rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-sm shadow-zinc-900/4 dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-black/20";

export const ADMIN_PAGE_STACK = "space-y-4";

export const ADMIN_SEARCH_WRAP =
  "relative min-w-[12rem] flex-1 sm:max-w-xs";

export const ADMIN_SEARCH_ICON =
  "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500";

export const adminSurfaceCard =
  "rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/4 dark:border-white/10 dark:bg-zinc-900/55 dark:shadow-lg dark:shadow-black/25";

export const adminSurfaceCardBlur = cn(adminSurfaceCard, "backdrop-blur-md");

export const adminDialogSurface =
  "border-zinc-200 bg-white text-zinc-900 shadow-xl dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-black/40";

export const adminDialogPanel =
  "rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100";

export const adminPickerBox =
  "max-h-40 overflow-y-auto overscroll-y-contain rounded-lg border border-zinc-200 bg-zinc-50 p-2 pr-1.5 [scrollbar-gutter:stable] dark:border-white/10 dark:bg-zinc-800/80";

export const adminPickerBoxLg =
  "max-h-48 overflow-y-auto overscroll-y-contain rounded-lg border border-zinc-200 bg-zinc-50 p-2 pr-1.5 [scrollbar-gutter:stable] dark:border-white/10 dark:bg-zinc-800/80";

export const adminChipIdle =
  "rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-left text-[13px] text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-white/10";

export const adminChipActive =
  "rounded-md border border-violet-500 bg-violet-600/15 px-2 py-1.5 text-left text-[13px] text-violet-800 dark:bg-violet-600/30 dark:text-white";

export const adminTagIdle =
  "shrink-0 rounded-full border border-zinc-300 bg-white px-3 py-1 text-[13px] text-zinc-700 transition hover:bg-zinc-100 dark:border-white/20 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-white/10";

export const adminTagActive =
  "shrink-0 rounded-full border border-violet-500 bg-violet-600 px-3 py-1 text-[13px] text-white";

export const adminPageTitle =
  "text-lg font-semibold tracking-tight text-zinc-900 dark:text-white";

export const adminSectionTitle =
  "text-xs font-semibold text-zinc-900 dark:text-white";

export const adminLead = "text-xs text-zinc-600 dark:text-zinc-400";

export const adminLabel =
  "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

export const adminInput =
  "w-full rounded-lg border border-zinc-200 bg-white p-2 text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/25 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:[color-scheme:dark]";

export const adminInputCompact =
  "w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-violet-500/40";

export const adminBorderSubtle = "border-zinc-200 dark:border-white/10";

export const adminSearchField = cn(ADMIN_CONTROL, "w-full px-3");

export const adminSearchFieldWide = cn("w-full max-w-sm", adminSearchField);
export const adminSearchFieldGrow = cn("min-w-0 flex-1", adminSearchField);

export const adminSearchFieldWithIcon = cn(adminSearchField, "pl-8 pr-3");
export const adminSearchFieldWithIcon9 = adminSearchFieldWithIcon;

export const adminTable =
  "admin-data-table min-w-full text-[12px] leading-snug";

export const adminTableDivide = "divide-y divide-zinc-200 dark:divide-white/10";
export const adminTableHeadRow =
  "text-left text-[10px] font-semibold text-zinc-500 dark:text-white/60";
export const adminTableMuted = "text-[11px] text-zinc-600 dark:text-white/70";
export const adminTableEmptyCell =
  "px-3 py-6 text-center text-[11px] text-zinc-500 dark:text-white/60";

export const adminStatusChip =
  "inline-flex max-w-full items-center gap-1 truncate rounded-md px-1.5 py-px text-[10px] font-semibold leading-4 tracking-tight";

export const adminStatusDot = "h-1.5 w-1.5 shrink-0 rounded-full";

export const adminStatusSuccess =
  "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25";
export const adminStatusWarning =
  "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/25";
export const adminStatusDanger =
  "bg-rose-50 text-rose-800 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25";
export const adminStatusNeutral =
  "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/10";
export const adminStatusInfo =
  "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25";
export const adminStatusViolet =
  "bg-violet-50 text-violet-800 ring-1 ring-violet-200/80 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-500/25";
export const adminCardTitle =
  "text-base font-semibold text-zinc-900 dark:text-white";
export const adminCardSubtitle = "text-xs text-zinc-600 dark:text-white/60";
export const adminRowSelected = "bg-violet-50/90 dark:bg-white/[0.06]";

export const adminKebabButton =
  "rounded-lg border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white";

export const adminDropdownPanel =
  "absolute right-0 z-20 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 text-left text-[13px] shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900";

export const adminDropdownItem =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10";

export const adminModerationPanel =
  "scroll-mt-24 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-900/4 dark:border-white/10 dark:bg-zinc-900/55 dark:shadow-lg dark:shadow-black/25";

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
