import { create } from "zustand";
import { MetadataResponse } from "../types/metadata.type";
import { API_BASE_URL } from "@/lib/api-base-url";

const CATALOG_CHANNEL = "jp-public-catalog";
const CATALOG_STORAGE_KEY = "jp-public-catalog-at";

type MetadataStore = {
  data: MetadataResponse | null;
  loading: boolean;
  fetchedAt: number | null;
  fetchMeta: (opts?: { force?: boolean }) => Promise<void>;
};

let inflight: Promise<void> | null = null;
let catalogListenersBound = false;

function bindCatalogSync(fetchMeta: (opts?: { force?: boolean }) => Promise<void>) {
  if (catalogListenersBound || typeof window === "undefined") return;
  catalogListenersBound = true;

  window.addEventListener("storage", (event) => {
    if (event.key !== CATALOG_STORAGE_KEY) return;
    void fetchMeta({ force: true });
  });

  try {
    const channel = new BroadcastChannel(CATALOG_CHANNEL);
    channel.addEventListener("message", () => {
      void fetchMeta({ force: true });
    });
  } catch {
    /* BroadcastChannel không hỗ trợ */
  }
}

export function notifyPublicCatalogChanged() {
  if (typeof window === "undefined") return;
  const at = String(Date.now());
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, at);
  } catch {
    /* private mode */
  }
  try {
    const channel = new BroadcastChannel(CATALOG_CHANNEL);
    channel.postMessage({ at });
    channel.close();
  } catch {
    /* ignore */
  }
}

export const useMetadataStore = create<MetadataStore>((set, get) => ({
  data: null,
  loading: false,
  fetchedAt: null,

  fetchMeta: async (opts) => {
    bindCatalogSync((next) => get().fetchMeta(next));

    if (inflight) {
      await inflight;
      if (!opts?.force) return;
    }

    const run = (async () => {
      set({ loading: true });
      try {
        if (!API_BASE_URL) return;
        const res = await fetch(`${API_BASE_URL}/metadata`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json: MetadataResponse = await res.json();
        set({ data: json, fetchedAt: Date.now() });
      } finally {
        set({ loading: false });
        inflight = null;
      }
    })();

    inflight = run;
    return run;
  },
}));
