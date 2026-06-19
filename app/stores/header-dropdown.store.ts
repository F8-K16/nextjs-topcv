import { create } from "zustand";

export type HeaderDropdownSlot = "notifications" | "messages";

let closeProfileMenuCallback: () => void = () => {};

type HeaderDropdownState = {
  openId: HeaderDropdownSlot | null;
  toggle: (id: HeaderDropdownSlot) => void;
  close: () => void;
  registerCloseProfileMenu: (fn: () => void) => void;
};

export const useHeaderDropdownStore = create<HeaderDropdownState>((set, get) => ({
  openId: null,

  toggle: (id) => {
    const prev = get().openId;
    const next = prev === id ? null : id;
    if (next !== null) {
      closeProfileMenuCallback();
    }
    set({ openId: next });
  },

  close: () => set({ openId: null }),

  registerCloseProfileMenu: (fn) => {
    closeProfileMenuCallback = fn;
  },
}));
