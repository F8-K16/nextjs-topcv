"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { AdminStatCard } from "@/components/admin/admin-stat-card";
import {
  Briefcase,
  ClipboardList,
  FolderTree,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";
import UserAvatar from "@/app/(main)/components/UserAvatar";
import Image from "next/image";
import { formatDate } from "@/utils/helper";
import { useAdminDashboardSummary } from "@/hooks/use-admin-dashboard-summary";
import {
  adminBorderSubtle,
  adminLead,
  adminPageTitle,
  adminSectionTitle,
  adminSurfaceCardBlur,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } =
    useAdminDashboardSummary();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const chartDark = !mounted || resolvedTheme === "dark";
  const gridStroke = chartDark ? "#ffffff14" : "#e4e4e7";
  const tickFill = chartDark ? "#a1a1aa" : "#52525b";
  const axisLine = chartDark ? "#ffffff20" : "#d4d4d8";
  const tooltipStyle = {
    background: chartDark ? "rgba(24,24,27,0.95)" : "rgba(255,255,255,0.98)",
    border: chartDark
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(228,228,231,1)",
    borderRadius: 12,
    fontSize: 12,
  };
  const tooltipLabel = chartDark ? "#e4e4e7" : "#3f3f46";
  const legendColor = chartDark ? "#d4d4d8" : "#52525b";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/6"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/6" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Không tải được dữ liệu tổng quan.</p>
        <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/80">
          Kiểm tra đăng nhập quản trị và cấu hình API.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-300/60 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-50 dark:ring-amber-400/40 dark:hover:bg-amber-500/30"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const chartRows = data.chart.months.map((m, i) => ({
    month: m,
    users: data.chart.users[i] ?? 0,
    jobs: data.chart.jobs[i] ?? 0,
    applications: data.chart.applications[i] ?? 0,
  }));

  const dailyRows = data.chartDaily.days.map((day, i) => {
    const [, m, d] = day.split("-").map(Number);
    const dayLabel = d && m ? `${d}/${m}` : day;
    return {
      day,
      dayLabel,
      users: data.chartDaily.users[i] ?? 0,
      jobs: data.chartDaily.jobs[i] ?? 0,
      applications: data.chartDaily.applications[i] ?? 0,
    };
  });

  const hotCategoryRows = data.topHotJobCategories.map((c) => ({
    name: c.name.length > 28 ? `${c.name.slice(0, 26)}…` : c.name,
    fullName: c.name,
    applicationCount: c.applicationCount,
  }));

  return (
    <div className="space-y-8 pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={adminPageTitle}>Tổng quan</h1>
          <p className={cn("mt-1", adminLead)}>
            Thống kê người dùng, tin tuyển dụng và ứng tuyển theo thời gian.
          </p>
        </div>
        {isFetching && (
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Đang làm mới…
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Người dùng"
          value={data.userCount}
          icon={Users}
          href="/admin/users"
          accent="from-sky-500/25 via-cyan-500/10 to-transparent"
        />
        <AdminStatCard
          title="Nhà tuyển dụng (đã duyệt)"
          value={data.employerApprovedCount}
          icon={UserCheck}
          href="/admin/users"
          accent="from-emerald-500/25 via-teal-500/10 to-transparent"
        />
        <AdminStatCard
          title="Ứng viên"
          value={data.candidateCount}
          icon={UserRound}
          href="/admin/users"
          accent="from-indigo-500/25 via-blue-500/10 to-transparent"
        />
        <AdminStatCard
          title="Việc làm"
          value={data.jobCount}
          icon={Briefcase}
          href="/admin/jobs"
          accent="from-violet-500/25 via-fuchsia-500/10 to-transparent"
        />
        <AdminStatCard
          title="Ứng tuyển"
          value={data.applicationCount}
          icon={ClipboardList}
          href="/admin/applications"
          accent="from-rose-500/25 via-orange-500/10 to-transparent"
        />
        <AdminStatCard
          title="Tin đang hiển thị"
          value={data.jobsActive}
          icon={Sparkles}
          href="/admin/jobs"
          accent="from-amber-500/25 via-yellow-500/10 to-transparent"
        />
        <AdminStatCard
          title="Tin hết hạn"
          value={data.jobsExpired}
          icon={Briefcase}
          href="/admin/jobs"
          accent="from-zinc-500/25 via-zinc-600/10 to-transparent"
        />
        <AdminStatCard
          title="Chờ duyệt tin"
          value={data.pendingJobs}
          icon={FolderTree}
          href="/admin/jobs"
          accent="from-orange-500/25 via-red-500/10 to-transparent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "xl:col-span-2 p-5 shadow-xl dark:shadow-black/30",
            adminSurfaceCardBlur,
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className={adminSectionTitle}>
              Hoạt động theo tháng
            </h2>
            <span className="text-xs text-zinc-500">6 tháng gần nhất</span>
          </div>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartRows}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: tickFill, fontSize: 11 }}
                  axisLine={{ stroke: axisLine }}
                />
                <YAxis
                  tick={{ fill: tickFill, fontSize: 11 }}
                  axisLine={{ stroke: axisLine }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: tooltipLabel }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: legendColor }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Người dùng"
                  stroke="#38bdf8"
                  fill="url(#fillUsers)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  name="Việc làm"
                  stroke="#a78bfa"
                  fill="url(#fillJobs)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Ứng tuyển"
                  stroke="#fb7185"
                  fill="url(#fillApps)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            "p-5 shadow-xl dark:shadow-black/30",
            adminSurfaceCardBlur,
          )}
        >
          <h2 className={adminSectionTitle}>Doanh thu</h2>
          <p className="mt-2 text-xs text-zinc-500">
            Module thanh toán chưa bật — hiển thị placeholder.
          </p>
          <p className="mt-6 text-3xl font-semibold text-zinc-800 tabular-nums dark:text-zinc-200">
            {data.revenueVnd != null
              ? `${data.revenueVnd.toLocaleString("vi-VN")} ₫`
              : "—"}
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "xl:col-span-2 p-5 shadow-xl dark:shadow-black/30",
            adminSurfaceCardBlur,
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className={adminSectionTitle}>
              Hoạt động tuyển dụng theo ngày
            </h2>
            <span className="text-xs text-zinc-500">30 ngày gần nhất</span>
          </div>
          <div className="h-75 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyRows}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="dayLabel"
                  tick={{ fill: tickFill, fontSize: 10 }}
                  axisLine={{ stroke: axisLine }}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fill: tickFill, fontSize: 11 }}
                  axisLine={{ stroke: axisLine }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: tooltipLabel }}
                  labelFormatter={(_, p) => {
                    const pl = p as unknown as
                      | { payload?: { day?: string } }[]
                      | undefined;
                    return pl?.[0]?.payload?.day ?? "";
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: legendColor }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Người dùng"
                  stroke="#38bdf8"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  name="Việc làm"
                  stroke="#a78bfa"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Ứng tuyển"
                  stroke="#fb7185"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className={cn(
            "p-5 shadow-xl dark:shadow-black/30",
            adminSurfaceCardBlur,
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className={adminSectionTitle}>
              Top ngành nghề hot
            </h2>
            <span className="text-xs text-zinc-500">90 ngày (ứng tuyển)</span>
          </div>
          {hotCategoryRows.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có dữ liệu ứng tuyển.</p>
          ) : (
            <div className="h-75 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={hotCategoryRows}
                  margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="barHotCategory"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#a78bfa"
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: tickFill, fontSize: 11 }}
                    axisLine={{ stroke: axisLine }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={108}
                    tick={{ fill: legendColor, fontSize: 10 }}
                    axisLine={{ stroke: axisLine }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: tooltipLabel }}
                    formatter={(v) => [
                      typeof v === "number" ? v : Number(v ?? 0),
                      "Ứng tuyển",
                    ]}
                    labelFormatter={(_label, p) => {
                      const pl = p as unknown as
                        | { payload?: { fullName?: string } }[]
                        | undefined;
                      return pl?.[0]?.payload?.fullName ?? "";
                    }}
                  />
                  <Bar
                    dataKey="applicationCount"
                    name="Số ứng tuyển"
                    fill="url(#barHotCategory)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={cn("p-5 shadow-xl", adminSurfaceCardBlur)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className={adminSectionTitle}>
              Top công ty (số tin)
            </h2>
            <Link
              href="/admin/companies"
              className="text-xs text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
            >
              Quản lý công ty →
            </Link>
          </div>
          <ul className="space-y-3">
            {data.topCompanies.length === 0 && (
              <li className="text-sm text-zinc-500">Chưa có dữ liệu.</li>
            )}
            {data.topCompanies.map((c, idx) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/5 dark:bg-black/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-xs font-bold text-zinc-800 dark:bg-white/10 dark:text-white">
                  {idx + 1}
                </span>
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-white/10">
                  <Image
                    src={c.logo || "/images/logo-default.png"}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{c.location}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-violet-700 dark:text-violet-200">
                  {c._count.jobs}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn("p-5 shadow-xl", adminSurfaceCardBlur)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className={adminSectionTitle}>Người dùng mới</h2>
            <Link
              href="/admin/users"
              className="text-xs text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
            >
              Quản lý người dùng →
            </Link>
          </div>
          <ul className="space-y-2">
            {data.recentUsers.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/5 dark:bg-black/20"
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-white/10">
                  <UserAvatar
                    avatar={u.avatar}
                    username={u.username}
                    size={36}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                    {u.username}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{u.email}</p>
                </div>
                {u.isBlocked ? (
                  <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-300">
                    Khóa
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                    OK
                  </span>
                )}
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className={cn("p-5 shadow-xl", adminSurfaceCardBlur)}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className={adminSectionTitle}>Việc làm mới đăng</h2>
          <Link
            href="/admin/jobs"
            className="text-xs text-violet-700 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
          >
            Quản lý việc làm →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr
                className={cn(
                  "border-b text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500",
                  adminBorderSubtle,
                )}
              >
                <th className="py-2 pr-3">Tiêu đề</th>
                <th className="py-2 pr-3">Công ty</th>
                <th className="py-2 pr-3">Địa điểm</th>
                <th className="py-2 pr-3">Hạn nộp</th>
                <th className="py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {data.recentJobs.map((j) => (
                <tr
                  key={j.id}
                  className="text-zinc-700 dark:text-zinc-200"
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={j.company.logo || "/images/logo-default.png"}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="line-clamp-1 font-medium text-zinc-900 dark:text-white">
                        {j.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-zinc-600 dark:text-zinc-400">
                    {j.company.name}
                  </td>
                  <td className="py-2.5 pr-3 text-zinc-600 dark:text-zinc-400">
                    {j.workLocation || j.company.location}
                  </td>
                  <td className="py-2.5 pr-3 text-zinc-600 dark:text-zinc-400">
                    {j.deadline ? formatDate(j.deadline) : "—"}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        j.moderationStatus === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                          : j.moderationStatus === "PENDING"
                            ? "bg-amber-500/15 text-amber-900 dark:text-amber-200"
                            : "bg-red-500/15 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {j.moderationStatus}
                    </span>
                    {j.isFeatured && (
                      <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-800 dark:text-violet-200">
                        Nổi bật
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}
