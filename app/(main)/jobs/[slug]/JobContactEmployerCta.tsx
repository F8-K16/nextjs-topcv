"use client";

import { MessageCircle } from "lucide-react";

import { useAuthStore } from "@/app/stores/auth.store";
import StartConversationNav from "@/app/(main)/components/chat/StartConversationNav";

type Props = {
  employerUserId: number;
  variant?: "compact" | "featured";
};

export default function JobContactEmployerCta({
  employerUserId,
  variant = "compact",
}: Props) {
  const roles = useAuthStore((s) => s.user?.roles);
  const loading = useAuthStore((s) => s.loadingAuth);
  const isCandidate = Boolean(roles?.includes("CANDIDATE"));

  if (loading || !isCandidate) return null;

  if (variant === "featured") {
    return (
      <div className="mt-6 rounded-2xl border border-[#00b14f]/20 bg-linear-to-br from-[#00b14f]/8 to-emerald-50/80 p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#00b14f]">
          Liên hệ nhà tuyển dụng
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Bắt đầu cuộc trò chuyện trực tiếp để hỏi thêm về công việc, quy trình
          phỏng vấn hoặc văn hóa công ty.
        </p>
        <StartConversationNav
          peerUserId={employerUserId}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#009944] disabled:cursor-wait disabled:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          Nhắn tin ngay
        </StartConversationNav>
      </div>
    );
  }

  return (
    <StartConversationNav
      peerUserId={employerUserId}
      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-[#00b14f]/40 hover:bg-[#00b14f]/5 disabled:cursor-wait disabled:opacity-80"
    >
      <MessageCircle className="h-4 w-4 text-[#00b14f]" />
      Liên hệ nhà tuyển dụng
    </StartConversationNav>
  );
}
