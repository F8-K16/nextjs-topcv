import { create } from "zustand";

export type AppConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type State = {
  isOpen: boolean;
  options: AppConfirmOptions | null;
};

let pendingResolve: ((value: boolean) => void) | null = null;

type ConfirmDialogStore = State & {
  request: (opts: AppConfirmOptions) => Promise<boolean>;
  finish: (ok: boolean) => void;
};

export const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
  isOpen: false,
  options: null,

  request: (opts) =>
    new Promise<boolean>((resolve) => {
      if (pendingResolve) {
        pendingResolve(false);
        pendingResolve = null;
      }
      pendingResolve = resolve;
      set({ isOpen: true, options: opts });
    }),

  finish: (ok) => {
    const fn = pendingResolve;
    pendingResolve = null;
    set({ isOpen: false, options: null });
    fn?.(ok);
  },
}));

/** Xác nhận thống nhất (Dialog), dùng ngoài khu vực Admin */
export function requestAppConfirm(opts: AppConfirmOptions): Promise<boolean> {
  return useConfirmDialogStore.getState().request(opts);
}
