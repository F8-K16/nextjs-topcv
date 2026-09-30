"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Minus, Send, X } from "lucide-react";
import { toast } from "sonner";

import UserAvatar from "@/app/(main)/components/UserAvatar";
import { useAuthStore } from "@/app/stores/auth.store";
import { useChatBoxStore } from "@/app/stores/chatbox.store";
import { useChatSocket } from "@/hooks/useChatSocket";
import {
  appendChatMessageIfNew,
  normalizeChatSocketRow,
} from "@/lib/chat-realtime";
import { STALE_CHAT_MESSAGES_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";
import {
  chatService,
  type ChatConversationListItem,
  type ChatConversationPeerContext,
  type ChatMessageRow,
} from "@/services/chat.service";

type ChatMessagesQueryData = {
  messages: ChatMessageRow[];
  hasMore: boolean;
  peerContext: ChatConversationPeerContext;
};

export default function ChatBoxThread({
  conversationId,
}: {
  conversationId: number;
}) {
  const qc = useQueryClient();
  const meId = useAuthStore((s) => s.user?.id);
  const showList = useChatBoxStore((s) => s.showList);
  const setOpen = useChatBoxStore((s) => s.setOpen);
  const socket = useChatSocket();
  const [draft, setDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => chatService.listMessages(conversationId),
    enabled: conversationId > 0,
    staleTime: STALE_CHAT_MESSAGES_MS,
  });

  const patchMessagesCache = useCallback(
    (msg: ChatMessageRow) => {
      qc.setQueryData<ChatMessagesQueryData>(
        ["chat-messages", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: appendChatMessageIfNew(old.messages, msg),
          };
        },
      );
    },
    [conversationId, qc],
  );

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!conversationId || meId == null) return;
    qc.setQueryData<{
      conversations: ChatConversationListItem[];
      totalUnread: number;
    }>(["chat-conversations", meId], (old) => {
      if (!old || !Array.isArray(old.conversations)) return old;
      const conv = old.conversations.find((c) => c.id === conversationId);
      const delta = conv?.unreadCount ?? 0;
      if (delta === 0) return old;
      const prevTotal =
        typeof old.totalUnread === "number" && !Number.isNaN(old.totalUnread)
          ? old.totalUnread
          : 0;
      return {
        totalUnread: Math.max(0, prevTotal - delta),
        conversations: old.conversations.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      };
    });
    void chatService
      .markConversationRead(conversationId)
      .then(() => {
        void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      })
      .catch(() => {});
  }, [conversationId, qc, meId]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (payload: {
      id: number;
      conversationId: number;
      body: string;
      kind?: "TEXT" | "IMAGE";
      imageUrl?: string | null;
      createdAt: string | Date;
      sender: { id: number; username: string; avatar?: string | null };
    }) => {
      if (payload.conversationId !== conversationId) return;
      patchMessagesCache(normalizeChatSocketRow(payload));
      if (payload.sender.id !== meId) {
        void chatService.markConversationRead(conversationId).catch(() => {});
      }
      void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    };
    socket.on("chat:message", onMsg);
    return () => {
      socket.off("chat:message", onMsg);
    };
  }, [socket, conversationId, qc, patchMessagesCache, meId]);

  useEffect(() => {
    requestAnimationFrame(scrollToBottom);
  }, [data?.messages.length, scrollToBottom, conversationId]);

  const clearPendingImage = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
  }, []);

  const sendComposer = useMutation({
    mutationFn: async (vars: { pendingFile: File | null; caption: string }) => {
      if (vars.pendingFile) {
        const fd = new FormData();
        fd.append("file", vars.pendingFile);
        const res = await fetch("/api/upload-chat-image", {
          method: "POST",
          body: fd,
        });
        const body = (await res.json()) as {
          secure_url?: string;
          error?: string;
        };
        if (!res.ok || !body.secure_url) {
          throw new Error(body.error || "Tải ảnh thất bại");
        }
        return chatService.postMessage(conversationId, {
          kind: "IMAGE",
          imageUrl: body.secure_url,
          body: vars.caption.trim(),
        });
      }
      const t = vars.caption.trim();
      if (!t) {
        const err = new Error("EMPTY");
        err.name = "EMPTY";
        throw err;
      }
      return chatService.postMessage(conversationId, {
        kind: "TEXT",
        body: t,
      });
    },
    onSuccess: (msg) => {
      patchMessagesCache(msg);
      setDraft("");
      clearPendingImage();
      void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (e: unknown) => {
      if (e instanceof Error && e.message === "EMPTY") {
        toast.error("Nhập tin nhắn hoặc chọn ảnh");
        return;
      }
      toast.error(getErrorToastMessage(e) || "Không gửi được tin nhắn");
    },
  });

  const sending = sendComposer.isPending;
  const peer = data?.peerContext;
  const messages = data?.messages ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
        <button
          type="button"
          onClick={showList}
          className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
          aria-label="Danh sách tin nhắn"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {peer ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <UserAvatar
              avatar={peer.companyLogo ?? peer.avatar}
              username={peer.companyName ?? peer.username}
              size={32}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {peer.role === "employer"
                  ? (peer.companyName ?? peer.username)
                  : peer.username}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {peer.role === "employer" ? "Nhà tuyển dụng" : "Ứng viên"}
              </p>
            </div>
          </div>
        ) : (
          <p className="flex-1 text-sm font-semibold">Tin nhắn</p>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          aria-label="Thu nhỏ"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-zinc-50/70 px-3 py-3"
      >
        {isPending ? (
          <p className="py-8 text-center text-xs text-zinc-500">Đang tải…</p>
        ) : isError ? (
          <button
            type="button"
            className="w-full py-6 text-center text-xs text-primary hover:underline"
            onClick={() => void refetch()}
          >
            Tải lại cuộc trò chuyện
          </button>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-500">
            Hãy bắt đầu bằng một lời chào.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender.id === meId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[13px] leading-relaxed ${
                    mine
                      ? "bg-primary text-white"
                      : "bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-100"
                  }`}
                >
                  {m.kind === "IMAGE" && m.imageUrl ? (
                    <div className="space-y-1">
                      <Image
                        src={m.imageUrl}
                        alt=""
                        width={220}
                        height={160}
                        className="max-h-40 w-auto rounded-lg object-contain"
                      />
                      {m.body.trim() ? (
                        <p className="whitespace-pre-wrap break-words">
                          {m.body}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {previewUrl ? (
        <div className="flex items-center gap-2 border-t border-zinc-100 bg-zinc-50 px-3 py-2">
          <Image
            src={previewUrl}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <button
            type="button"
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-200"
            onClick={clearPendingImage}
            aria-label="Gỡ ảnh"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <form
        className="flex shrink-0 items-end gap-1.5 border-t border-zinc-100 bg-white p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (sending) return;
          sendComposer.mutate({ pendingFile, caption: draft });
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (!f.type.startsWith("image/") || f.size > 8 * 1024 * 1024) {
              toast.error("Ảnh JPG/PNG/WebP/GIF, tối đa 8MB");
              return;
            }
            setPreviewUrl((prev) => {
              if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
              return URL.createObjectURL(f);
            });
            setPendingFile(f);
          }}
        />
        <button
          type="button"
          disabled={sending}
          className="mb-0.5 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary disabled:opacity-50"
          aria-label="Đính kèm ảnh"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <textarea
          rows={1}
          className="max-h-24 min-h-10 min-w-0 flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white"
          placeholder="Nhắn tin…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={8000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sending) sendComposer.mutate({ pendingFile, caption: draft });
            }
          }}
        />
        <button
          type="submit"
          disabled={sending || (!draft.trim() && !pendingFile)}
          className="mb-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40"
          aria-label="Gửi"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
