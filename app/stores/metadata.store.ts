import { create } from "zustand";
import { MetadataResponse } from "../types/metadata.type";
import { API_BASE_URL } from "@/lib/api-base-url";

type MetadataStore = {
  data: MetadataResponse | null;
  loading: boolean;
  fetchMeta: () => Promise<void>;
};

export const useMetadataStore = create<MetadataStore>((set) => ({
  data: null,
  loading: false,

  fetchMeta: async () => {
    set({ loading: true });

    try {
      const res = await fetch(`${API_BASE_URL}/metadata`);
      const json: MetadataResponse = await res.json();

      set({ data: json });
    } finally {
      set({ loading: false });
    }
  },
}));
