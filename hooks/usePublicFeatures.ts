import { useMetadataStore } from "@/app/stores/metadata.store";

export function usePublicFeatures() {
  const features = useMetadataStore((s) => s.data?.features);
  return {
    ai: features?.ai === true,
    opensearch: features?.opensearch === true,
  };
}
