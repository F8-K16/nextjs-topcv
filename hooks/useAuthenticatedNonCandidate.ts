import { useAuthStore } from "@/app/stores/auth.store";

export function useAuthenticatedNonCandidate(): boolean {
  const user = useAuthStore((s) => s.user);
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  return Boolean(user?.id && !isCandidate);
}
