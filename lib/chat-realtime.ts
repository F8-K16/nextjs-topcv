import type { ChatMessageRow } from "@/services/chat.service";

export function appendChatMessageIfNew(
  list: ChatMessageRow[],
  msg: ChatMessageRow,
): ChatMessageRow[] {
  if (list.some((m) => m.id === msg.id)) return list;
  return [...list, msg];
}

export function normalizeChatSocketRow(payload: {
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
