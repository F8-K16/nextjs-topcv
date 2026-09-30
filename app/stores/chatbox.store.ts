import { create } from "zustand";

type ChatBoxState = {
  open: boolean;
  conversationId: number | null;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  openConversation: (conversationId: number) => void;
  showList: () => void;
};

export const useChatBoxStore = create<ChatBoxState>((set) => ({
  open: false,
  conversationId: null,

  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),

  openConversation: (conversationId) =>
    set({
      open: true,
      conversationId: Number.isFinite(conversationId) ? conversationId : null,
    }),

  showList: () => set({ open: true, conversationId: null }),
}));
