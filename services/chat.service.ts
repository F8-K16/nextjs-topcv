import axiosClient from "@/lib/axios";
import { handleAxiosError } from "@/utils/helper";

export type ChatPeer = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
};

export type ChatMessageKind = "TEXT" | "IMAGE";

export type ChatConversationListItem = {
  id: number;
  peer: ChatPeer;
  lastMessage: {
    body: string;
    createdAt: string;
    kind?: ChatMessageKind;
  } | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatMessageSender = {
  id: number;
  username: string;
  avatar: string | null;
};

export type ChatMessageRow = {
  id: number;
  kind: ChatMessageKind;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  sender: ChatMessageSender;
};

export type ChatConversationPeerContext = {
  peerUserId: number;
  username: string;
  avatar: string | null;
  role: "employer" | "candidate";
  companyName: string | null;
  companyLogo: string | null;
};

export type PostChatMessagePayload =
  | { kind: "TEXT"; body: string }
  | { kind: "IMAGE"; imageUrl: string; body?: string };

export const chatService = {
  async ensureConversation(peerUserId: number) {
    try {
      const res = await axiosClient.post<{ conversation: { id: number } }>(
        "/chat/conversations",
        { peerUserId },
      );
      return res.data.conversation;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listConversations() {
    try {
      const res = await axiosClient.get<{
        conversations: ChatConversationListItem[];
        totalUnread: number;
      }>("/chat/conversations");
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async markConversationRead(conversationId: number) {
    try {
      await axiosClient.post(`/chat/conversations/${conversationId}/read`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async listMessages(conversationId: number, beforeId?: number) {
    try {
      const qs =
        beforeId != null ? `?beforeId=${encodeURIComponent(String(beforeId))}` : "";
      const res = await axiosClient.get<{
        messages: ChatMessageRow[];
        hasMore: boolean;
        peerContext: ChatConversationPeerContext;
      }>(`/chat/conversations/${conversationId}/messages${qs}`);
      return res.data;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async postMessage(conversationId: number, payload: PostChatMessagePayload) {
    try {
      const body =
        payload.kind === "TEXT"
          ? { kind: "TEXT" as const, body: payload.body }
          : {
              kind: "IMAGE" as const,
              imageUrl: payload.imageUrl,
              body: payload.body ?? "",
            };
      const res = await axiosClient.post<{ message: ChatMessageRow }>(
        `/chat/conversations/${conversationId}/messages`,
        body,
      );
      return res.data.message;
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteMessage(conversationId: number, messageId: number) {
    try {
      await axiosClient.delete(
        `/chat/conversations/${conversationId}/messages/${messageId}`,
      );
    } catch (e) {
      throw handleAxiosError(e);
    }
  },

  async deleteConversation(conversationId: number) {
    try {
      await axiosClient.delete(`/chat/conversations/${conversationId}`);
    } catch (e) {
      throw handleAxiosError(e);
    }
  },
};
