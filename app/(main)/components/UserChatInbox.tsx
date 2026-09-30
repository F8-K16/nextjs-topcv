"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useFixedDropdownPlacement } from "@/hooks/use-fixed-dropdown-placement";
import { Loader2, MessageCircle } from "lucide-react";

import UserAvatar from "@/app/(main)/components/UserAvatar";
import { STALE_CHAT_CONVERSATIONS_MS } from "@/lib/query-stale-time";

import { useHeaderDropdownStore } from "@/app/stores/header-dropdown.store";
import { useChatBoxStore } from "@/app/stores/chatbox.store";
import { useAuthStore } from "@/app/stores/auth.store";
import { useChatSocket } from "@/hooks/useChatSocket";
import {
  chatService,
  type ChatConversationListItem,
} from "@/services/chat.service";

const PREVIEW_LIMIT = 8;

function sortForPreview(items: ChatConversationListItem[]) {
  return [...items].sort((a, b) => {
    const ua = a.unreadCount ?? 0;
    const ub = b.unreadCount ?? 0;
    if (ub !== ua) return ub - ua;
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });
}

const BTN_CLASS =
  "relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-[#00b14f]";
const ICON_CLASS = "h-[22px] w-[22px]";

export default function UserChatInbox() {
  const pathname = usePathname();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const meId = useAuthStore((s) => s.user?.id);
  const socket = useChatSocket();
  const openId = useHeaderDropdownStore((s) => s.openId);
  const toggle = useHeaderDropdownStore((s) => s.toggle);
  const close = useHeaderDropdownStore((s) => s.close);
  const openConversation = useChatBoxStore((s) => s.openConversation);
  const open = openId === "messages";

  const closePanel = useCallback(() => {
    close();
  }, [close]);

  const togglePanel = useCallback(() => {
    toggle("messages");
  }, [toggle]);

  const { data, isFetching } = useQuery({
    queryKey: ["chat-conversations", meId],
    queryFn: () => chatService.listConversations(),
    enabled: isAuthenticated && meId != null,
    staleTime: STALE_CHAT_CONVERSATIONS_MS,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket) return;
    const onMsg = (payload: {
      conversationId: number;
      sender: { id: number };
    }) => {
      if (payload.sender.id !== meId) {
        void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      }
    };
    socket.on("chat:message", onMsg);
    return () => {
      socket.off("chat:message", onMsg);
    };
  }, [socket, qc, meId]);

  const totalUnread = data?.totalUnread ?? 0;
  const activeConversationId = useMemo(() => {
    const m = pathname?.match(/^\/messages\/(\d+)\/?$/);
    return m ? Number(m[1]) : null;
  }, [pathname]);
  const activeThreadUnread = useMemo(() => {
    if (activeConversationId == null) return 0;
    return (
      data?.conversations?.find((c) => c.id === activeConversationId)
        ?.unreadCount ?? 0
    );
  }, [activeConversationId, data?.conversations]);
  const badgeUnread = Math.max(0, totalUnread - activeThreadUnread);
  const preview = useMemo(() => {
    const list = data?.conversations ?? [];
    return sortForPreview(list).slice(0, PREVIEW_LIMIT);
  }, [data?.conversations]);

  const goToConversation = useCallback(
    (id: number) => {
      openConversation(id);
      closePanel();
    },
    [openConversation, closePanel],
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelMaxWidthPx = 416;
  const panelStyle = useFixedDropdownPlacement(
    isAuthenticated && open,
    buttonRef,
    panelMaxWidthPx,
  );

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={BTN_CLASS}
        title="Tin nhắn"
        aria-label="Tin nhắn"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          togglePanel();
        }}
      >
        <MessageCircle className={ICON_CLASS} strokeWidth={1.75} />
        {badgeUnread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {badgeUnread > 99 ? "99+" : badgeUnread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          style={panelStyle}
          className="flex min-h-0 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-xl shadow-zinc-200/50"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-600">
            <span>Tin nhắn</span>
            <Link
              href="/messages"
              className="text-[#00b14f] hover:underline"
              onClick={() => closePanel()}
            >
              Xem tất cả
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isFetching && !preview.length ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm opacity-70">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải…
              </div>
            ) : preview.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm opacity-70">
                Chưa có cuộc trò chuyện
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {preview.map((c) => {
                  const unread = (c.unreadCount ?? 0) > 0;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => goToConversation(c.id)}
                        className={`flex w-full gap-3 px-3 py-2.5 text-left text-sm transition ${
                          unread
                            ? "bg-[#00b14f]/5 hover:bg-[#00b14f]/10"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <div
                          className={`relative shrink-0 ${unread ? "ring-2 ring-[#00b14f]/50 ring-offset-1 rounded-full" : ""}`}
                        >
                          <UserAvatar
                            avatar={c.peer.avatar}
                            username={c.peer.username}
                            size={40}
                          />
                        </div>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`line-clamp-1 leading-snug ${unread ? "font-semibold text-zinc-900" : "font-medium"}`}
                          >
                            {c.peer.username}
                          </span>
                          <span className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                            {c.lastMessage?.body ?? "Chưa có tin nhắn"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
