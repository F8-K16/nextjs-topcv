"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { MessageCircle, X } from "lucide-react";

import UserAvatar from "@/app/(main)/components/UserAvatar";
import ChatBoxThread from "@/app/(main)/components/chat/ChatBoxThread";
import { useAuthStore } from "@/app/stores/auth.store";
import { useChatBoxStore } from "@/app/stores/chatbox.store";
import { useChatSocket } from "@/hooks/useChatSocket";
import { STALE_CHAT_CONVERSATIONS_MS } from "@/lib/query-stale-time";
import {
  chatService,
  type ChatConversationListItem,
} from "@/services/chat.service";

function sortConversations(items: ChatConversationListItem[]) {
  return [...items].sort((a, b) => {
    const ua = a.unreadCount ?? 0;
    const ub = b.unreadCount ?? 0;
    if (ub !== ua) return ub - ua;
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });
}

export default function ChatBoxWidget() {
  const pathname = usePathname() || "/";
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadingAuth = useAuthStore((s) => s.loadingAuth);
  const meId = user?.id;
  const socket = useChatSocket();
  const open = useChatBoxStore((s) => s.open);
  const conversationId = useChatBoxStore((s) => s.conversationId);
  const toggle = useChatBoxStore((s) => s.toggle);
  const setOpen = useChatBoxStore((s) => s.setOpen);
  const openConversation = useChatBoxStore((s) => s.openConversation);

  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const isEmployer = Boolean(user?.roles?.includes("EMPLOYER"));
  const allowed = isCandidate || isEmployer;
  const hideOnFullInbox = pathname.startsWith("/messages");

  const { data, isFetching } = useQuery({
    queryKey: ["chat-conversations", meId],
    queryFn: () => chatService.listConversations(),
    enabled: Boolean(isAuthenticated && meId != null && allowed && !hideOnFullInbox),
    staleTime: STALE_CHAT_CONVERSATIONS_MS,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket || !allowed) return;
    const onMsg = () => {
      void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    };
    socket.on("chat:message", onMsg);
    return () => {
      socket.off("chat:message", onMsg);
    };
  }, [socket, qc, allowed]);

  const list = useMemo(
    () => sortConversations(data?.conversations ?? []),
    [data?.conversations],
  );
  const totalUnread = data?.totalUnread ?? 0;

  if (loadingAuth || !isAuthenticated || !allowed || hideOnFullInbox) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-40 flex flex-col items-end gap-3 sm:right-5 sm:bottom-5">
      {open ? (
        <div className="pointer-events-auto flex h-[min(32rem,calc(100vh-6.5rem))] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15 dark:border-white/10 dark:bg-zinc-950">
          {conversationId ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatBoxThread conversationId={conversationId} />
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Tin nhắn
                </p>
                <div className="flex items-center gap-1">
                  <Link
                    href="/messages"
                    className="px-2 text-xs font-semibold text-primary hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Mở trang
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"
                    aria-label="Đóng"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {isFetching && list.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-zinc-500">
                    Đang tải…
                  </p>
                ) : list.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-zinc-500">
                    Chưa có cuộc trò chuyện. Nhắn tin từ tin tuyển dụng hoặc hồ
                    sơ ứng viên để bắt đầu.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-white/10">
                    {list.map((c) => {
                      const unread = (c.unreadCount ?? 0) > 0;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            className={`flex w-full gap-3 px-3 py-2.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-white/5 ${
                              unread ? "bg-[#00b14f]/5" : ""
                            }`}
                            onClick={() => openConversation(c.id)}
                          >
                            <UserAvatar
                              avatar={c.peer.avatar}
                              username={c.peer.username}
                              size={40}
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={`line-clamp-1 ${unread ? "font-semibold text-zinc-900" : "font-medium text-zinc-800 dark:text-zinc-100"}`}
                              >
                                {c.peer.username}
                              </span>
                              <span className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                                {c.lastMessage?.kind === "IMAGE" &&
                                !c.lastMessage.body?.trim()
                                  ? "Ảnh"
                                  : (c.lastMessage?.body ?? "Chưa có tin nhắn")}
                              </span>
                            </span>
                            {unread ? (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-emerald-700/30 transition hover:brightness-110"
        aria-label={open ? "Đóng hộp chat" : "Mở hộp chat"}
        aria-expanded={open}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.2} />
        ) : (
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        )}
        {!open && totalUnread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        ) : null}
      </button>
    </div>
  );
}
