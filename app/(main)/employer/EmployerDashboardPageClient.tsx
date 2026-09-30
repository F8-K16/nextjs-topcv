"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { employerPortalService } from "@/services/employer-portal.service";
import { JOB_MODERATION_OPTIONS } from "@/app/types/job.type";
import { formatDate } from "@/utils/helper";
import {
  EmployerQueryError,
  EmployerQueryLoading,
} from "./employer-query-ui";
import { STALE_EMPLOYER_DASHBOARD_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";

const MSG_SUB =
  "Quản lý tin tuyển dụng và hồ sơ ứng viên cho công ty của bạn.";
const MSG_FLOW =
  "Đăng tin → Chờ duyệt → Nhận hồ sơ → Sàng lọc ứng viên.";
const NOTE_BOX =
  "Tin tạo từ khu vực nhà tuyển dụng sẽ ở trạng thái chờ duyệt cho đến khi quản trị viên phê duyệt.";
const L_JOBS = "Tin tuyển dụng";
const L_APP = "Hồ sơ ứng tuyển";
const L_RECENT_JOBS = "Tin gần đây";
const L_RECENT_APP = "Ứng tuyển gần đây";
const L_VIEW_ALL = "Xem tất cả";
const L_APPROVED = "Đã duyệt";
const L_APP_PENDING = "Chờ xử lý";
const L_APP_REVIEWED = "Đã xem";
const L_APP_ACCEPTED = "Đạt";
const L_APP_REJECTED = "Loại";
const L_APPS_COUNT = "Ứng tuyển";
const L_ACTION = "Cần xử lý";
const L_JOBS_PENDING_CARD = "Tin chờ duyệt";
const L_APPS_PENDING_CARD = "Hồ sơ chưa xử lý";
const L_JOBS_REJECTED_CARD = "Tin bị từ chối";
const L_GO = "Xem ngay";
const L_ONBOARD = "Bắt đầu nhanh";
const L_STEP_CO = "Hồ sơ công ty";
const L_STEP_JOB = "Đăng tin";
const L_STEP_APP = "Ứng tuyển";

function modLabel(v: string | undefined) {
  return JOB_MODERATION_OPTIONS.find((o) => o.value === v)?.label ?? v ?? "—";
}

function modBadgeClass(v: string | undefined) {
  switch (v) {
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "APPROVED":
      return "bg-emerald-100 text-emerald-900";
    case "REJECTED":
      return "bg-red-100 text-red-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function appStatusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: L_APP_PENDING,
    REVIEWED: L_APP_REVIEWED,
    ACCEPTED: L_APP_ACCEPTED,
    REJECTED: L_APP_REJECTED,
  };
  return map[s] ?? s;
}

function appBadgeClass(s: string) {
  switch (s) {
    case "PENDING":
      return "bg-amber-100 text-amber-900";
    case "REVIEWED":
      return "bg-sky-100 text-sky-900";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-900";
    case "REJECTED":
      return "bg-red-100 text-red-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export default function EmployerDashboardPageClient() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-portal-dashboard", userId],
    queryFn: () => employerPortalService.dashboard(),
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_DASHBOARD_MS,
  });

  if (userId == null || isPending) {
    return <EmployerQueryLoading />;
  }

  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const { stats, recentJobs, recentApplications, company } = data;
  const companyProfileDone = Boolean(company?.logo);
  const jobsDone = stats.jobs.total > 0;
  const appsReceived = stats.applications.total > 0;

  const actionItems: Array<{
    key: string;
    title: string;
    count: number;
    href: string;
    tone: "amber" | "red";
  }> = [];
  if (stats.jobs.pending > 0) {
    actionItems.push({
      key: "jobs-pending",
      title: L_JOBS_PENDING_CARD,
      count: stats.jobs.pending,
      href: "/employer/jobs?moderationStatus=PENDING",
      tone: "amber",
    });
  }
  if (stats.applications.pending > 0) {
    actionItems.push({
      key: "apps-pending",
      title: L_APPS_PENDING_CARD,
      count: stats.applications.pending,
      href: "/employer/applications?status=PENDING",
      tone: "amber",
    });
  }
  if (stats.jobs.rejected > 0) {
    actionItems.push({
      key: "jobs-rejected",
      title: L_JOBS_REJECTED_CARD,
      count: stats.jobs.rejected,
      href: "/employer/jobs?moderationStatus=REJECTED",
      tone: "red",
    });
  }

  const showOnboarding = !companyProfileDone || !jobsDone;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          {company?.name || "Công ty"}
          <span className="font-medium text-zinc-400"> · hôm nay</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{MSG_SUB}</p>
      </div>

      {actionItems.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900">{L_ACTION}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actionItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex flex-col rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
                  item.tone === "red"
                    ? "border-red-200 bg-red-50/90"
                    : "border-amber-200 bg-amber-50/90"
                }`}
              >
                <span className="text-sm font-medium text-zinc-800">
                  {item.title}
                </span>
                <span className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
                  {item.count}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {L_GO}
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {showOnboarding ? (
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">{L_ONBOARD}</h2>
        <p className="mt-1 text-xs text-zinc-500">{MSG_FLOW}</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          <li>
            <Link
              href="/employer/company"
              className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 transition hover:border-zinc-200"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  companyProfileDone
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {companyProfileDone ? <Check className="h-4 w-4" /> : "1"}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {L_STEP_CO}
                </p>
                <p className="text-xs text-zinc-500">
                  {companyProfileDone ? "Đã có logo" : "Bổ sung thông tin"}
                </p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              href="/employer/jobs/new"
              className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 transition hover:border-zinc-200"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  jobsDone
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {jobsDone ? <Check className="h-4 w-4" /> : "2"}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {L_STEP_JOB}
                </p>
                <p className="text-xs text-zinc-500">
                  {jobsDone
                    ? `${stats.jobs.total} tin`
                    : "Tạo tin tuyển dụng"}
                </p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              href="/employer/applications"
              className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 transition hover:border-zinc-200"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  appsReceived
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {appsReceived ? <Check className="h-4 w-4" /> : "3"}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {L_STEP_APP}
                </p>
                <p className="text-xs text-zinc-500">
                  {appsReceived
                    ? `${stats.applications.total} hồ sơ`
                    : "Sau khi có ứng viên"}
                </p>
              </div>
            </Link>
          </li>
        </ol>
      </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: L_JOBS, value: stats.jobs.total, href: "/employer/jobs" },
          {
            label: L_APPROVED,
            value: stats.jobs.approved,
            href: "/employer/jobs?moderationStatus=APPROVED",
          },
          {
            label: L_APP,
            value: stats.applications.total,
            href: "/employer/applications",
          },
          {
            label: L_APP_PENDING,
            value: stats.applications.pending,
            href: "/employer/applications?status=PENDING",
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-[#00b14f]/40"
          >
            <p className="text-xs font-medium text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-900">
              {L_RECENT_JOBS}
            </span>
            <Link
              href="/employer/jobs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {L_VIEW_ALL}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100">
            {recentJobs.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-zinc-500">
                {"Chưa có tin nào"}
              </li>
            )}
            {recentJobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/employer/jobs/${job.id}/edit`}
                    className="font-medium text-zinc-900 hover:text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${modBadgeClass(job.moderationStatus)}`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {modLabel(job.moderationStatus)}
                    </span>
                    <span>
                      {job.category?.name ?? ""}
                      {job.category?.name ? " · " : ""}
                      {job._count?.applications ?? 0} {L_APPS_COUNT}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/employer/jobs/${job.id}/edit`}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  {"Sửa"}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <span className="text-sm font-semibold text-zinc-900">
              {L_RECENT_APP}
            </span>
            <Link
              href="/employer/applications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {L_VIEW_ALL}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100">
            {recentApplications.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-zinc-500">
                {"Chưa có hồ sơ"}
              </li>
            )}
            {recentApplications.map((row) => {
              const name = row.candidate.user.username || "Ứ";
              return (
              <li key={row.id} className="px-4 py-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00b14f]/10 text-sm font-semibold text-[#087a38]">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900">{name}</div>
                        <div className="truncate text-xs text-zinc-500">
                          {row.job.title}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${appBadgeClass(row.status)}`}
                      >
                        {appStatusLabel(row.status)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(row.createdAt)}
                    </div>
                  </div>
                </div>
              </li>
              );
            })}
          </ul>
        </div>
      </div>

      {showOnboarding ? (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{NOTE_BOX}</p>
      </div>
      ) : null}
    </div>
  );
}
