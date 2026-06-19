"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FileText, MapPin, MessageCircle } from "lucide-react";

import { employerPortalService } from "@/services/employer-portal.service";
import { EmployerQueryError, EmployerQueryLoading } from "../employer-query-ui";
import { STALE_EMPLOYER_SUGGESTED_CANDIDATES_MS } from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import StartConversationNav from "@/app/(main)/components/chat/StartConversationNav";

export default function EmployerSuggestionsPageClient() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["employer-suggested-candidates", userId],
    queryFn: () => employerPortalService.suggestedCandidates(30),
    retry: 1,
    enabled: userId != null,
    staleTime: STALE_EMPLOYER_SUGGESTED_CANDIDATES_MS,
  });

  if (userId == null || isPending) {
    return <EmployerQueryLoading />;
  }

  if (isError || !data) {
    return <EmployerQueryError error={error} onRetry={() => void refetch()} />;
  }

  const items = data.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Gợi ý ứng viên</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ứng viên đã nộp hồ sơ vào tin của bạn hoặc có ngành nghề phù hợp với
          tin đang tuyển.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center text-zinc-500">
          Chưa có gợi ý. Hãy đăng tin hoặc chờ ứng viên ứng tuyển.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-3">
          {items.map((row) => (
            <li
              key={row.user.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <p className="font-semibold text-zinc-900">{row.user.username}</p>
              <p className="text-xs text-zinc-500">{row.user.email}</p>
              {(row.district?.name || row.province?.name) && (
                <p className="mt-2 flex items-center gap-1 text-xs text-zinc-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {[row.district?.name, row.province?.name]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-500">{row.hint}</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  row.reason === "applied"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-sky-50 text-sky-800"
                }`}
              >
                {row.reason === "applied" ? "Đã ứng tuyển" : "Phù hợp"}
              </span>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/employer/suggestions/candidate/${row.candidateId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  Xem CV
                </Link>
                <StartConversationNav
                  peerUserId={row.user.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-wait disabled:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Nhắn tin
                </StartConversationNav>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
