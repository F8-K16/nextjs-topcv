"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";

import UserAvatar from "@/app/(main)/components/UserAvatar";
import { useAuthStore } from "@/app/stores/auth.store";
import { STALE_CHAT_CONVERSATIONS_MS } from "@/lib/query-stale-time";
import { chatService } from "@/services/chat.service";

export default function MessagesPageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const peer = sp.get("peerUserId");
  const { isAuthenticated, loadingAuth, user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (!peer || loadingAuth || !isAuthenticated) return;

    const id = Number(peer);
    if (Number.isNaN(id)) return;
    let cancelled = false;
    void (async () => {
      try {
        const conv = await chatService.ensureConversation(id);
        if (!cancelled) router.replace(`/messages/${conv.id}`);
      } catch {
        if (!cancelled) router.replace("/messages");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [peer, loadingAuth, isAuthenticated, router]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["chat-conversations", userId],
    queryFn: () => chatService.listConversations(),
    enabled: Boolean(isAuthenticated && userId != null && !peer),
    staleTime: STALE_CHAT_CONVERSATIONS_MS,
  });
  const list = data?.conversations ?? [];

  if (loadingAuth) {
    return <div className="p-8 text-center text-zinc-500">Đang tải…</div>;
  }
  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600">
        Vui lòng đăng nhập để xem tin nhắn.
      </div>
    );
  }

  if (peer) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-zinc-600">
        Đang mở cuộc trò chuyện…
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="p-8 text-center text-zinc-500">Đang tải danh sách…</div>
    );
  }
  if (isError) {
    return (
      <button
        type="button"
        onClick={() => void refetch()}
        className="text-primary hover:underline"
      >
        Tải lại
      </button>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200/90 bg-white p-12 text-center text-zinc-600 shadow-sm md:p-16">
        <MessageCircle className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
        <p className="font-medium">Chưa có cuộc trò chuyện nào.</p>
        <p className="mt-1 text-sm text-zinc-500">
          Chọn ứng viên hoặc nhà tuyển dụng để bắt đầu nhắn tin.
        </p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
      {list.map((c) => {
        const preview =
          c.lastMessage?.kind === "IMAGE" && !c.lastMessage.body?.trim()
            ? "Ảnh"
            : (c.lastMessage?.body ?? "Chưa có tin nhắn");
        const timeLabel = (() => {
          const raw = c.lastMessageAt ?? c.lastMessage?.createdAt;
          if (!raw) return null;
          const d = new Date(raw);
          if (Number.isNaN(d.getTime())) return null;
          const now = new Date();
          const sameDay =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
          return new Intl.DateTimeFormat("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            ...(sameDay
              ? { hour: "2-digit", minute: "2-digit" }
              : { day: "numeric", month: "short" }),
          }).format(d);
        })();

        return (
          <li key={c.id} className="border-b border-zinc-100 last:border-b-0">
            <Link
              href={`/messages/${c.id}`}
              className="flex gap-4 px-3 py-3 transition hover:bg-zinc-50/90 md:gap-5 md:px-4 md:py-4"
            >
              <div
                className={`shrink-0 ${c.unreadCount > 0 ? "ring-2 ring-[#00b14f]/40 rounded-full ring-offset-2" : ""}`}
              >
                <UserAvatar
                  avatar={c.peer.avatar}
                  username={c.peer.username}
                  size={52}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={
                      c.unreadCount > 0
                        ? "font-semibold text-zinc-900"
                        : "font-semibold text-zinc-800"
                    }
                  >
                    {c.peer.username}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    {timeLabel ? (
                      <span className="text-xs text-zinc-400">{timeLabel}</span>
                    ) : null}
                    {c.unreadCount > 0 ? (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-zinc-500">
                  {preview}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
