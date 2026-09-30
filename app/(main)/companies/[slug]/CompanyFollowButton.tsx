"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_COMPANY_FOLLOW_STATUS_MS } from "@/lib/query-stale-time";
import { companyFollowService } from "@/services/company-follow.service";
import { getErrorToastMessage } from "@/lib/submit-error";

type Props = {
  companyId: number;
  companyName: string;
};

export default function CompanyFollowButton({
  companyId,
  companyName,
}: Props) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const qk = ["company-follow", companyId, user?.id] as const;

  const { data: status } = useQuery({
    queryKey: qk,
    queryFn: () => companyFollowService.check(companyId),
    enabled: !!user?.id && isCandidate,
    staleTime: STALE_COMPANY_FOLLOW_STATUS_MS,
  });

  const following = status?.following ?? false;

  const followMut = useMutation({
    mutationFn: () => companyFollowService.follow(companyId),
    onMutate: async () => {
      setLoading(true);
      await qc.cancelQueries({ queryKey: qk });
      const prev = qc.getQueryData<{ following: boolean }>(qk);
      qc.setQueryData(qk, { following: true });
      return { prev };
    },
    onSuccess: () => {
      toast.success(`Đang theo dõi ${companyName}`);
    },
    onError: (e, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
      toast.error(getErrorToastMessage(e) || "Không theo dõi được");
    },
    onSettled: () => {
      setLoading(false);
      void qc.invalidateQueries({ queryKey: qk });
      void qc.invalidateQueries({ queryKey: ["followed-companies"] });
    },
  });

  const unfollowMut = useMutation({
    mutationFn: () => companyFollowService.unfollow(companyId),
    onMutate: async () => {
      setLoading(true);
      await qc.cancelQueries({ queryKey: qk });
      const prev = qc.getQueryData<{ following: boolean }>(qk);
      qc.setQueryData(qk, { following: false });
      return { prev };
    },
    onSuccess: () => {
      toast.success(`Đã bỏ theo dõi ${companyName}`);
    },
    onError: (e, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
      toast.error(getErrorToastMessage(e) || "Không bỏ theo dõi được");
    },
    onSettled: () => {
      setLoading(false);
      void qc.invalidateQueries({ queryKey: qk });
      void qc.invalidateQueries({ queryKey: ["followed-companies"] });
    },
  });

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          const next = `${window.location.pathname}${window.location.search}`;
          router.push(`/auth/login?redirect=${encodeURIComponent(next)}`);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        <Bell className="h-4 w-4" />
        Đăng nhập để theo dõi
      </button>
    );
  }

  if (!isCandidate) {
    return null;
  }

  const onClick = () => {
    if (following) unfollowMut.mutate();
    else followMut.mutate();
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
        following
          ? "border border-white/30 bg-white text-[#00b14f] hover:bg-white/95"
          : "border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {following ? "Đang theo dõi" : "Theo dõi công ty"}
    </button>
  );
}
