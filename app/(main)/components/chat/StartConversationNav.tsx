"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useChatBoxStore } from "@/app/stores/chatbox.store";
import { chatService } from "@/services/chat.service";
import { getErrorToastMessage } from "@/lib/submit-error";

type Props = {
  peerUserId: number;
  className?: string;
  children: ReactNode;
};

/**
 * Mở chatbox góc màn hình — tạo cuộc trò chuyện nếu chưa có.
 */
export default function StartConversationNav({
  peerUserId,
  className,
  children,
}: Props) {
  const qc = useQueryClient();
  const openConversation = useChatBoxStore((s) => s.openConversation);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  const open = useCallback(async () => {
    if (inFlight.current || !Number.isFinite(peerUserId) || peerUserId <= 0) {
      return;
    }
    inFlight.current = true;
    setPending(true);
    try {
      const conv = await chatService.ensureConversation(peerUserId);
      void qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      openConversation(conv.id);
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Không mở được cuộc trò chuyện");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, [peerUserId, qc, openConversation]);

  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      aria-busy={pending}
      onClick={() => void open()}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>Đang mở…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
