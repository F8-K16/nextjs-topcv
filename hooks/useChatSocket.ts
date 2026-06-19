"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { useAuthStore } from "@/app/stores/auth.store";
import { SOCKET_IO_BASE_URL } from "@/lib/api-base-url";

const socketOrigin = SOCKET_IO_BASE_URL ?? "";

export function useChatSocket(): Socket | null {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !socketOrigin) {
      return;
    }

    const s = io(socketOrigin, {
      path: "/socket.io",
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    const onConnect = () => {
      setSocket(s);
    };

    const onConnectError = (err: Error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[useChatSocket] connect_error", err.message);
      }
    };

    s.once("connect", onConnect);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("connect", onConnect);
      s.off("connect_error", onConnectError);
      s.disconnect();
      setSocket(null);
    };
  }, [accessToken]);

  return socket;
}
