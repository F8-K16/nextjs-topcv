"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { employerPortalService } from "@/services/employer-portal.service";
import {
  EmployerQueryError,
  EmployerQueryLoading,
} from "../employer-query-ui";
import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_EMPLOYER_DASHBOARD_MS } from "@/lib/query-stale-time";

const SOURCE_LABEL: Record<string, string> = {
  direct: "Truy cập trực tiếp",
  organic: "Tìm kiếm (Google…)",
  jobs: "Danh sách việc làm",
  company: "Trang công ty",
  home: "Trang chủ",
  search: "Tìm kiếm nội bộ",
  referral: "Giới thiệu / liên kết",
  social: "Mạng xã hội",
  email: "Email",
  other: "Khác",
};

const PIE_COLORS = [
  "#00b14f",
  "#087a38",
  "#38bdf8",
  "#f59e0b",
  "#a78bfa",
  "#f43f5e",
  "#64748b",
  "#14b8a6",
];

export default function EmployerAnalyticsPageClient() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-portal-analytics", userId],
    queryFn: () => employerPortalService.analytics(),
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_DASHBOARD_MS,
  });

  const topJobs = useMemo(
    () =>
      (data?.jobs ?? [])
        .slice()
        .sort((a, b) => b.views - a.views)
        .slice(0, 8)
        .map((job) => ({
          ...job,
          shortTitle:
            job.title.length > 22 ? `${job.title.slice(0, 20)}…` : job.title,
        })),
    [data?.jobs],
  );

  const sourceChart = useMemo(
    () =>
      (data?.sources ?? []).map((row) => ({
        ...row,
        label: SOURCE_LABEL[row.source] ?? row.source,
      })),
    [data?.sources],
  );

  if (userId == null || isPending) return <EmployerQueryLoading />;
  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Phân tích tin</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Theo dõi lượt xem, tỉ lệ ứng tuyển và nguồn traffic để tối ưu tin
          đăng.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tin đang theo dõi", value: summary.jobs },
          { label: "Tổng lượt xem", value: summary.views },
          { label: "Hồ sơ ứng tuyển", value: summary.applications },
          {
            label: "Tỉ lệ xem → apply",
            value: `${summary.conversionRate}%`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Lượt xem theo tin
          </h2>
          <div className="mt-3 h-64">
            {topJobs.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-zinc-500">
                Chưa có dữ liệu xem tin.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart data={topJobs} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="shortTitle"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} width={36} />
                  <Tooltip
                    formatter={(value) => [Number(value), "Lượt xem"]}
                    labelFormatter={(_, payload) =>
                      String(payload?.[0]?.payload?.title ?? "")
                    }
                  />
                  <Bar dataKey="views" fill="#00b14f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Nguồn traffic
          </h2>
          <div className="mt-3 h-64">
            {sourceChart.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-zinc-500">
                Chưa ghi nhận nguồn traffic. Mở trang tin công khai để bắt đầu
                thu thập.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={sourceChart}
                    dataKey="views"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={84}
                    paddingAngle={2}
                  >
                    {sourceChart.map((entry, index) => (
                      <Cell
                        key={entry.source}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [Number(value), String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {sourceChart.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {sourceChart.map((row, index) => (
                <li
                  key={row.source}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  {row.label}: {row.views}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
          Chi tiết theo tin
        </div>
        {data.jobs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">
            Chưa có tin tuyển dụng.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {data.jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/employer/jobs/${job.id}/edit`}
                    className="font-medium text-zinc-900 hover:text-primary hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {job.views} xem · {job.applications} ứng tuyển · tỉ lệ{" "}
                    {job.conversionRate}%
                    {job.sources[0]
                      ? ` · nguồn chính: ${SOURCE_LABEL[job.sources[0].source] ?? job.sources[0].source}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/employer/applications?jobId=${job.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Xem hồ sơ
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
