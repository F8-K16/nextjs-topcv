"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useChatSocket } from "@/hooks/useChatSocket";
import { invalidateNotificationQueries } from "@/lib/invalidate-notification-queries";

export function useNotificationRealtime(enabled: boolean) {
  const socket = useChatSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !socket) return;

    const onNew = () => {
      invalidateNotificationQueries(qc);
    };

    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [enabled, socket, qc]);
}
