"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  ACCESS_DENIED_SEARCH_PARAM,
  ACCESS_DENIED_VALUE,
} from "@/lib/access-denied-notice";

const TOAST_MESSAGE = "Bạn không có quyền truy cập trang này.";

export function AccessDeniedToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (searchParams.get(ACCESS_DENIED_SEARCH_PARAM) !== ACCESS_DENIED_VALUE) {
      handled.current = false;
      return;
    }
    if (handled.current) return;
    handled.current = true;

    toast.error(TOAST_MESSAGE, { id: "access-denied" });

    const next = new URLSearchParams(searchParams.toString());
    next.delete(ACCESS_DENIED_SEARCH_PARAM);
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
