import type { QueryClient } from "@tanstack/react-query";

export function invalidateNotificationQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ["notifications-unread"] });
  void qc.invalidateQueries({ queryKey: ["notifications-preview"] });
  void qc.invalidateQueries({ queryKey: ["notifications"] });
  void qc.invalidateQueries({ queryKey: ["notification"] });
}
