import { create } from "zustand";

type ModalType = "login" | "apply" | "register" | "confirm" | "cv-draft" | null;

export type ModalOpenData = Record<string, unknown> & {
  jobId?: number;
  cvId?: number;
  cvTitle?: string;
  cvThumbnailUrl?: string | null;
  cvLastEditedAt?: string;
};

interface ModalStore {
  type: ModalType;
  data?: ModalOpenData | null;
  isOpen: boolean;

  openModal: (type: ModalType, data?: ModalOpenData | null) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: null,
  isOpen: false,

  openModal: (type, data) =>
    set({
      type,
      data: data ?? null,
      isOpen: true,
    }),

  closeModal: () =>
    set({
      type: null,
      data: null,
      isOpen: false,
    }),
}));
