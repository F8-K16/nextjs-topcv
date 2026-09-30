"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight } from "lucide-react";

import axiosClient from "@/lib/axios";
import { formatSalaryShort } from "@/utils/helper";
import { cn } from "@/lib/utils";

type SalaryInsightRow = {
  id: number;
  label: string;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  jobCount: number;
};

type SalaryInsightResponse = {
  by: "category" | "province";
  items: SalaryInsightRow[];
  generatedAt: string;
};

async function fetchSalaryInsights(by: "category" | "province") {
  const res = await axiosClient.get<SalaryInsightResponse>(
    `/insights/salary?by=${by}`,
  );
  return res.data;
}

function toTrieu(value: number) {
  return Math.round(value / 1_000_000);
}

export default function SalaryInsightSection() {
  const [by, setBy] = useState<"category" | "province">("category");
  const { data, isPending, isError } = useQuery({
    queryKey: ["salary-insights", by],
    queryFn: () => fetchSalaryInsights(by),
    staleTime: 5 * 60_000,
  });

  const chartData = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        ...item,
        shortLabel:
          item.label.length > 18 ? `${item.label.slice(0, 16)}…` : item.label,
        avgTrieu: toTrieu(item.avgSalary),
      })),
    [data?.items],
  );

  return (
    <section className="border-b border-zinc-200/80 bg-white py-8 md:py-14">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Salary Insight
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-900 md:text-3xl">
              Mức lương trung bình theo vị trí
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Tổng hợp từ các tin đang mở trên TopCV — giúp ứng viên và nhà tuyển
              dụng nắm mặt bằng thị trường.
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
            {(
              [
                ["category", "Theo ngành"],
                ["province", "Theo khu vực"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBy(value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  by === value
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-4 shadow-sm md:p-6">
          {isPending ? (
            <div className="h-72 animate-pulse rounded-xl bg-zinc-200/70" />
          ) : isError || chartData.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-500">
              Chưa đủ dữ liệu lương để hiển thị biểu đồ.
            </div>
          ) : (
            <>
              <div className="h-72 w-full md:h-80">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      interval={0}
                      angle={-28}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      tickFormatter={(v) => `${v}tr`}
                      width={42}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${Number(value)} triệu`,
                        "Lương TB",
                      ]}
                      labelFormatter={(_, payload) =>
                        String(payload?.[0]?.payload?.label ?? "")
                      }
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#e4e4e7",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="avgTrieu"
                      fill="#00b14f"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {chartData.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5"
                  >
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#087a38]">
                      {toTrieu(item.avgSalary)} triệu
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.jobCount} tin ·{" "}
                      {formatSalaryShort(item.minSalary, item.maxSalary)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-4 flex justify-end">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Xem việc làm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
