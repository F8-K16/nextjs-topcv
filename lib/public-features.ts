export type PublicFeatures = {
  ai: boolean;
  opensearch: boolean;
};

export function readPublicFeatures(payload: unknown): PublicFeatures {
  if (!payload || typeof payload !== "object") {
    return { ai: false, opensearch: false };
  }
  const features = (payload as { features?: { ai?: unknown; opensearch?: unknown } })
    .features;
  return {
    ai: features?.ai === true,
    opensearch: features?.opensearch === true,
  };
}

export async function fetchPublicFeatures(apiBase: string): Promise<PublicFeatures> {
  const base = apiBase.trim().replace(/\/$/, "");
  if (!base) return { ai: false, opensearch: false };
  try {
    const res = await fetch(`${base}/metadata`, {
      cache: "no-store",
    });
    if (!res.ok) return { ai: false, opensearch: false };
    return readPublicFeatures(await res.json());
  } catch {
    return { ai: false, opensearch: false };
  }
}
