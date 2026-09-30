"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileText,
  MapPin,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Star,
  Zap,
  Users,
} from "lucide-react";

import { employerPortalService } from "@/services/employer-portal.service";
import { EmployerQueryError, EmployerQueryLoading } from "../employer-query-ui";
import { STALE_EMPLOYER_SUGGESTED_CANDIDATES_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import StartConversationNav from "@/app/(main)/components/chat/StartConversationNav";
import { cn } from "@/lib/utils";

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Tất cả kinh nghiệm" },
  { value: "INTERN", label: "Thực tập sinh" },
  { value: "FRESHER", label: "Fresher" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MIDDLE", label: "Middle" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Leader/Manager" },
];

const REASON_META: Record<
  string,
  { label: string; colorClass: string; icon: React.ReactNode }
> = {
  applied: {
    label: "Đã ứng tuyển",
    colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: <FileText className="h-3 w-3" />,
  },
  skill_match: {
    label: "Khớp kỹ năng",
    colorClass: "bg-violet-50 text-violet-800 border-violet-200",
    icon: <Zap className="h-3 w-3" />,
  },
  multi_match: {
    label: "Nhiều tiêu chí phù hợp",
    colorClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <Star className="h-3 w-3" />,
  },
  category_match: {
    label: "Ngành phù hợp",
    colorClass: "bg-sky-50 text-sky-800 border-sky-200",
    icon: <Briefcase className="h-3 w-3" />,
  },
};

export default function EmployerSuggestionsPageClient() {
  const userId = useAuthStore((s) => s.user?.id);
  const [page, setPage] = useState(1);
  const [jobId, setJobId] = useState<number | undefined>(undefined);
  const [experienceLevel, setExperienceLevel] = useState("");

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-suggested-candidates", userId, page, jobId, experienceLevel],
    queryFn: () =>
      employerPortalService.suggestedCandidates({
        limit: 12,
        page,
        jobId,
        experienceLevel: experienceLevel || undefined,
      }),
    retry: 1,
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_SUGGESTED_CANDIDATES_MS,
  });

  // Fetch employer's jobs for filter dropdown
  const { data: jobsData } = useQuery({
    queryKey: ["employer-jobs-filter", userId],
    queryFn: () => employerPortalService.listJobs("limit=50&lifecycle=active"),
    enabled: userId != null,
    staleTime: 60_000,
  });

  const employerJobs =
    (jobsData?.jobs as Array<{ id: number; title: string }> | undefined) ?? [];

  if (userId == null || isPending) {
    return <EmployerQueryLoading />;
  }

  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const items = data.items ?? [];
  const pagination = data.pagination;
  const context = data.context;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Gợi ý ứng viên</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Xếp hạng theo mức độ phù hợp: kỹ năng, ngành nghề, kinh nghiệm, địa
          điểm và lịch sử ứng tuyển.
        </p>
      </div>

      {/* Context summary */}
      {context && (
        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
            <Briefcase className="h-3.5 w-3.5" />
            {context.jobCount} tin đang tuyển
          </span>
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
            <Zap className="h-3.5 w-3.5" />
            {context.skillCount} kỹ năng yêu cầu
          </span>
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
            <Users className="h-3.5 w-3.5" />
            {pagination.total} ứng viên phù hợp
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Filter by job */}
        <select
          value={jobId ?? ""}
          onChange={(e) => {
            setJobId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tất cả tin tuyển dụng</option>
          {employerJobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        {/* Filter by experience */}
        <select
          value={experienceLevel}
          onChange={(e) => {
            setExperienceLevel(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-zinc-500">
          Chưa có gợi ý. Hãy đăng tin hoặc chờ ứng viên ứng tuyển.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((row) => {
              const reasonMeta =
                REASON_META[row.reason] ?? REASON_META.category_match!;
              return (
                <li
                  key={row.user.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  {/* Top */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {row.user.username}
                        </p>
                        <p className="text-xs text-zinc-500">{row.user.email}</p>
                      </div>
                      {/* Reason badge */}
                      <span
                        className={cn(
                          "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          reasonMeta.colorClass,
                        )}
                      >
                        {reasonMeta.icon}
                        {reasonMeta.label}
                      </span>
                    </div>

                    {/* Location */}
                    {(row.district?.name || row.province?.name) && (
                      <p className="flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {[row.district?.name, row.province?.name]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {/* Match details */}
                    <div className="flex flex-wrap gap-1.5">
                      {row.matchedSkillCount > 0 && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700">
                          {row.matchedSkillCount} kỹ năng khớp
                        </span>
                      )}
                      {row.matchedCategoryCount > 0 && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                          {row.matchedCategoryCount} ngành khớp
                        </span>
                      )}
                    </div>

                    {/* Hint */}
                    <p className="text-xs text-zinc-400">{row.hint}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/employer/suggestions/candidate/${row.candidateId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Xem CV
                    </Link>
                    <StartConversationNav
                      peerUserId={row.user.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-wait disabled:opacity-90"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Nhắn tin
                    </StartConversationNav>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-zinc-500">
                Trang {pagination.page}/{pagination.totalPages} · {pagination.total} ứng viên
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-40"
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
