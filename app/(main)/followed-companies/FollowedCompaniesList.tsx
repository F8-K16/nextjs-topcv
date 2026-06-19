"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_FOLLOWED_COMPANIES_MS } from "@/lib/query-stale-time";
import { companyFollowService } from "@/services/company-follow.service";
import { formatDate, formatGeographyLine } from "@/utils/helper";
import { getErrorToastMessage } from "@/lib/submit-error";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";

export default function FollowedCompaniesList() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));

  const { data = [], isLoading } = useQuery({
    queryKey: ["followed-companies", user?.id],
    queryFn: companyFollowService.listFollowed,
    enabled: !!user?.id && isCandidate,
    staleTime: STALE_FOLLOWED_COMPANIES_MS,
  });

  const unfollow = useMutation({
    mutationFn: (companyId: number) => companyFollowService.unfollow(companyId),
    onSuccess: () => {
      toast.success("Đã bỏ theo dõi");
      void qc.invalidateQueries({ queryKey: ["followed-companies"] });
    },
    onError: (e) => {
      toast.error(getErrorToastMessage(e) || "Thao tác thất bại");
    },
  });

  if (user?.id && !isCandidate) {
    return (
      <CandidateOnlyNotice className="py-10">
        Theo dõi công ty chỉ dành cho tài khoản ứng viên. Với nhà tuyển dụng,
        hãy dùng khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        Bạn chưa theo dõi công ty nào. Mở trang công ty và chọn &quot;Theo dõi
        công ty&quot;.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map(({ company, followedAt }) => (
        <li
          key={company.id}
          className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href={`/companies/${company.id}`}
            className="flex min-w-0 flex-1 items-start gap-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-gray-100">
              <Image
                src={company.logo || "/images/logo-default.png"}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="56px"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 hover:text-[#00b14f]">
                {company.name}
              </p>
              <p className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatGeographyLine(
                    company.location,
                    company.district?.name,
                    company.province?.name,
                  )}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                Theo dõi từ{" "}
                {formatDate(followedAt)}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => unfollow.mutate(company.id)}
            disabled={unfollow.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Bỏ theo dõi
          </button>
        </li>
      ))}
    </ul>
  );
}
