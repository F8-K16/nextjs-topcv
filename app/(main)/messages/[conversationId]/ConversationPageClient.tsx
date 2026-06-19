"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import UserAvatar from "@/app/(main)/components/UserAvatar";
import { useAuthStore } from "@/app/stores/auth.store";
import { useChatSocket } from "@/hooks/useChatSocket";
import {
  chatService,
  type ChatConversationListItem,
  type ChatConversationPeerContext,
  type ChatMessageRow,
} from "@/services/chat.service";
import { STALE_CHAT_MESSAGES_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";
import { requestAppConfirm } from "@/app/stores/confirm-dialog.store";

import ChatConversationImageUpload from "./ChatConversationImageUpload";

type ChatMessagesQueryData = {
  messages: ChatMessageRow[];
  hasMore: boolean;
  peerContext: ChatConversationPeerContext;
};

function appendMessageIfNew(
  list: ChatMessageRow[],
  msg: ChatMessageRow,
): ChatMessageRow[] {
  if (list.some((m) => m.id === msg.id)) return list;
  return [...list, msg];
}

function normalizeSocketRow(payload: {
  id: number;
  conversationId: number;
  body: string;
  kind?: "TEXT" | "IMAGE";
  imageUrl?: string | null;
  createdAt: string | Date;
  sender: { id: number; username: string; avatar?: string | null };
}): ChatMessageRow {
  const created =
    typeof payload.createdAt === "string"
      ? payload.createdAt
      : new Date(payload.createdAt).toISOString();
  return {
    id: payload.id,
    kind: payload.kind ?? "TEXT",
    body: payload.body,
    imageUrl: payload.imageUrl ?? null,
    createdAt: created,
    sender: {
      id: payload.sender.id,
      username: payload.sender.username,
      avatar: payload.sender.avatar ?? null,
    },
  };
}

export default function ConversationPageClient() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const conversationId = Number(params.conversationId);
  const meId = useAuthStore((s) => s.user?.id);
  const socket = useChatSocket();

  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgLenRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [peerTyping, setPeerTyping] = useState(false);
  const peerTypingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => chatService.listMessages(conversationId),
    enabled: Number.isFinite(conversationId) && conversationId > 0,
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
            messages: appendMessageIfNew(old.messages, msg),
          };
        },
      );
    },
    [conversationId, qc],
  );

  const removeMessageEverywhere = useCallback(
    (messageId: number) => {
      qc.setQueryData<ChatMessagesQueryData>(
        ["chat-messages", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.filter((m) => m.id !== messageId),
          };
        },
      );
    },
    [conversationId, qc],
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const onMessagesScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isNearBottomRef.current = near;
    if (near) setNewMsgCount(0);
  }, []);

  useEffect(() => {
    if (
      !Number.isFinite(conversationId) ||
      conversationId <= 0 ||
      meId == null
    ) {
      return;
    }
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
    prevMsgLenRef.current = 0;
    isNearBottomRef.current = true;
    const raf = requestAnimationFrame(() => setNewMsgCount(0));
    return () => cancelAnimationFrame(raf);
  }, [conversationId]);

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
      const row = normalizeSocketRow(payload);
      patchMessagesCache(row);
      if (row.sender.id !== meId) {
        void chatService
          .markConversationRead(conversationId)
          .then(() => {
            void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
          })
          .catch(() => {});
      } else {
        void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      }
    };
    socket.on("chat:message", onMsg);
    return () => {
      socket.off("chat:message", onMsg);
    };
  }, [socket, conversationId, qc, patchMessagesCache, meId]);

  useEffect(() => {
    if (!socket || !meId) return;
    const onTyping = (p: {
      conversationId: number;
      userId: number;
      typing: boolean;
    }) => {
      if (p.conversationId !== conversationId || p.userId === meId) return;
      if (peerTypingClearRef.current) {
        clearTimeout(peerTypingClearRef.current);
        peerTypingClearRef.current = null;
      }
      setPeerTyping(p.typing);
      if (p.typing) {
        peerTypingClearRef.current = setTimeout(() => {
          setPeerTyping(false);
          peerTypingClearRef.current = null;
        }, 3500);
      }
    };
    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:typing", onTyping);
      if (peerTypingClearRef.current) {
        clearTimeout(peerTypingClearRef.current);
      }
    };
  }, [socket, conversationId, meId]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    const emit = (typing: boolean) => {
      socket.emit("chat:typing", { conversationId, typing });
    };
    const clearStop = () => {
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
    };
    if (!draft.trim()) {
      clearStop();
      emit(false);
      return;
    }
    emit(true);
    clearStop();
    typingStopTimerRef.current = setTimeout(() => {
      emit(false);
      typingStopTimerRef.current = null;
    }, 2000);
    return () => {
      clearStop();
    };
  }, [draft, socket, conversationId]);

  useEffect(() => {
    return () => {
      if (socket && conversationId) {
        socket.emit("chat:typing", { conversationId, typing: false });
      }
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current);
      }
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (isPending || !data) return;
    const list = data.messages;
    const len = list.length;
    const prev = prevMsgLenRef.current;

    if (prev === 0 && len > 0) {
      prevMsgLenRef.current = len;
      isNearBottomRef.current = true;
      requestAnimationFrame(() => setNewMsgCount(0));
      requestAnimationFrame(() => scrollToBottom("auto"));
      requestAnimationFrame(() => onMessagesScroll());
      return;
    }

    if (len > prev) {
      const added = list.slice(prev);
      const peerAdded = added.filter((m) => m.sender.id !== meId).length;
      const last = list[len - 1];

      if (last && last.sender.id === meId) {
        requestAnimationFrame(() => scrollToBottom("auto"));
        requestAnimationFrame(() => setNewMsgCount(0));
        isNearBottomRef.current = true;
      } else if (peerAdded > 0) {
        if (isNearBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
          requestAnimationFrame(() => setNewMsgCount(0));
        } else {
          requestAnimationFrame(() => setNewMsgCount((c) => c + peerAdded));
        }
      }
      prevMsgLenRef.current = len;
    } else if (len < prev) {
      prevMsgLenRef.current = len;
    }
  }, [isPending, data, meId, scrollToBottom, onMessagesScroll]);

  const clearPendingImage = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
  }, []);

  useEffect(() => {
    return () => {
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const handleFileSelected = useCallback((file: File) => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
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
        const data = (await res.json()) as {
          secure_url?: string;
          error?: string;
        };
        if (!res.ok || !data.secure_url) {
          throw new Error(data.error || "Tải ảnh thất bại");
        }
        return chatService.postMessage(conversationId, {
          kind: "IMAGE",
          imageUrl: data.secure_url,
          body: vars.caption.trim(),
        });
      }
      const t = vars.caption.trim();
      if (t) {
        return chatService.postMessage(conversationId, {
          kind: "TEXT",
          body: t,
        });
      }
      const err = new Error("EMPTY");
      err.name = "EMPTY";
      throw err;
    },
    onSuccess: (msg) => {
      socket?.emit("chat:typing", { conversationId, typing: false });
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

  const deleteMsg = useMutation({
    mutationFn: (messageId: number) =>
      chatService.deleteMessage(conversationId, messageId),
    onSuccess: (_, messageId) => {
      removeMessageEverywhere(messageId);
      void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (e: unknown) => {
      toast.error(getErrorToastMessage(e) || "Không xóa được tin nhắn");
    },
  });

  const deleteConv = useMutation({
    mutationFn: () => chatService.deleteConversation(conversationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.removeQueries({ queryKey: ["chat-messages", conversationId] });
      router.push("/messages");
      toast.success("Đã xóa cuộc trò chuyện");
    },
    onError: (e: unknown) => {
      toast.error(getErrorToastMessage(e) || "Không xóa được cuộc trò chuyện");
    },
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !(
          document.querySelector("[data-chat-header-menu]")?.contains(t) ??
          false
        )
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  if (!Number.isFinite(conversationId) || conversationId <= 0) {
    return (
      <p className="text-center text-red-600">Cuộc trò chuyện không hợp lệ.</p>
    );
  }

  if (isPending) {
    return <div className="text-center text-zinc-500">Đang tải tin nhắn…</div>;
  }
  if (isError) {
    return (
      <div className="text-center">
        <p className="text-zinc-600">Không tải được cuộc trò chuyện.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-2 text-primary hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const peer = data.peerContext;
  const sending = sendComposer.isPending;
  const messages = data.messages;

  return (
    <div className="flex h-[min(80vh,840px)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-md md:min-h-[32rem]">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 bg-white px-3 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="shrink-0 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {peer ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              {peer.role === "employer" && peer.companyLogo ? (
                <Image
                  src={peer.companyLogo}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  sizes="48px"
                />
              ) : (
                <UserAvatar
                  avatar={peer.avatar}
                  username={peer.username}
                  size={48}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {peer.role === "employer" ? (
                <>
                  <p className="truncate font-semibold text-zinc-900">
                    {peer.companyName ?? peer.username}
                  </p>
                  <p className="truncate text-sm text-zinc-500">
                    {peer.companyName ? peer.username : "Nhà tuyển dụng"}
                  </p>
                </>
              ) : (
                <>
                  <p className="truncate font-semibold text-zinc-900">
                    {peer.username}
                  </p>
                  <p className="text-sm text-zinc-500">Ứng viên</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/messages"
            className="min-w-0 flex-1 text-sm font-semibold text-zinc-900"
          >
            Tin nhắn
          </Link>
        )}

        <div className="relative shrink-0" data-chat-header-menu>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                disabled={deleteConv.isPending}
                onClick={() => {
                  setMenuOpen(false);
                  void (async () => {
                    const ok = await requestAppConfirm({
                      title: "Xóa cuộc trò chuyện?",
                      description:
                        "Xóa toàn bộ cuộc trò chuyện? Hành động này không thể hoàn tác.",
                      confirmLabel: "Xóa",
                      variant: "destructive",
                    });
                    if (ok) void deleteConv.mutateAsync();
                  })();
                }}
              >
                Xóa cuộc trò chuyện
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onMessagesScroll}
        className="relative flex-1 space-y-3 overflow-y-auto bg-zinc-50/40 px-4 py-5 md:px-6"
      >
        {messages.length === 0 ? (
          <p className="px-2 text-center text-sm leading-relaxed text-zinc-500">
            Hãy bắt đầu cuộc trò chuyện bằng một lời chào.
          </p>
        ) : null}
        {messages.map((m) => {
          const mine = m.sender.id === meId;
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine ? (
                <div className="shrink-0 self-end pb-0.5">
                  <UserAvatar
                    avatar={m.sender.avatar}
                    username={m.sender.username}
                    size={36}
                  />
                </div>
              ) : null}
              <div
                className={`group relative max-w-[min(92%,40rem)] rounded-2xl px-3.5 py-2.5 text-sm md:max-w-[min(85%,36rem)] ${
                  mine ? "bg-primary text-white" : "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-100"
                }`}
              >
                {!mine ? (
                  <p className="mb-0.5 text-xs font-semibold opacity-80">
                    {m.sender.username}
                  </p>
                ) : null}
                {m.kind === "IMAGE" && m.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative max-h-64 overflow-hidden rounded-lg">
                      <Image
                        src={m.imageUrl}
                        alt=""
                        width={400}
                        height={320}
                        className="max-h-64 w-auto object-contain"
                        sizes="(max-width: 768px) 85vw, 320px"
                      />
                    </div>
                    {m.body.trim() ? (
                      <p className="whitespace-pre-wrap break-words text-sm opacity-95">
                        {m.body}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                )}
                {mine ? (
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        const ok = await requestAppConfirm({
                          title: "Xóa tin nhắn?",
                          description: "Xóa tin nhắn này? Hành động không thể hoàn tác.",
                          confirmLabel: "Xóa",
                          variant: "destructive",
                        });
                        if (ok) void deleteMsg.mutate(m.id);
                      })();
                    }}
                    className="absolute -right-1 -top-1 rounded-full bg-black/35 p-1 text-white opacity-100 shadow-sm transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Xóa tin nhắn"
                    aria-label="Xóa tin nhắn"
                    disabled={deleteMsg.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {newMsgCount > 0 ? (
          <div className="sticky bottom-3 z-10 mt-2 flex justify-center pb-1 pointer-events-none">
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-md transition hover:bg-zinc-50"
              onClick={() => {
                setNewMsgCount(0);
                isNearBottomRef.current = true;
                scrollToBottom("smooth");
              }}
            >
              {newMsgCount === 1
                ? "1 tin nhắn mới"
                : `${newMsgCount} tin nhắn mới`}
            </button>
          </div>
        ) : null}
      </div>

      {peerTyping ? (
        <p className="shrink-0 border-t border-zinc-100 bg-zinc-50/60 px-4 py-2.5 text-xs text-zinc-500 md:px-6">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {peer?.username ?? "Đối phương"} đang soạn tin…
          </span>
        </p>
      ) : null}

      <form
        className="flex shrink-0 flex-col gap-2 border-t border-zinc-100 bg-white p-3 md:p-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (sending) return;
          sendComposer.mutate({ pendingFile, caption: draft });
        }}
      >
        <ChatConversationImageUpload
          disabled={sending}
          fileInputRef={fileInputRef}
          previewUrl={previewUrl}
          onFileSelected={handleFileSelected}
          onClear={clearPendingImage}
          onOpenPicker={() => fileInputRef.current?.click()}
        />
        <div className="flex flex-wrap items-end gap-2">
          <textarea
            rows={1}
            className="min-h-11 max-h-48 min-w-0 flex-1 resize-y rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm leading-relaxed outline-none transition placeholder:text-zinc-400 focus:border-primary focus:bg-white"
            placeholder="Nhập tin nhắn hoặc chú thích kèm ảnh…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={8000}
          />
          <button
            type="submit"
            disabled={sending || (!draft.trim() && !pendingFile)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Gửi
          </button>
        </div>
      </form>
    </div>
  );
}
