"use client";

import { useLayoutEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";

const MARGIN = 12;

function fallbackPlacement(
  panelMaxWidth: number,
  matchAnchorWidth: boolean,
): CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 390;
  const width = matchAnchorWidth
    ? Math.min(Math.max(vw - 2 * MARGIN, 160), panelMaxWidth)
    : Math.min(panelMaxWidth, vw - 2 * MARGIN);
  return {
    position: "fixed",
    top: 72,
    left: MARGIN,
    width,
    maxHeight: 280,
    zIndex: 110,
  };
}

/**
 * Positions a dropdown with `position: fixed` from the anchor rect so it
 * stays inside the visual viewport (mobile keyboard, safe areas, short screens).
 */
export function useFixedDropdownPlacement(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelMaxWidth: number,
  /** Panel width follows anchor (dropdown under full-width triggers). */
  matchAnchorWidth = false,
): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const measure = () => {
      const el = anchorRef.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const viewportTop = window.visualViewport?.offsetTop ?? 0;
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const viewportBottom = viewportTop + viewportHeight;

      let width: number;
      let left: number;

      if (matchAnchorWidth) {
        width = Math.min(
          Math.max(r.width, 120),
          panelMaxWidth,
          vw - 2 * MARGIN,
        );
        left = r.left;
        if (left + width > vw - MARGIN) left = vw - MARGIN - width;
        if (left < MARGIN) left = MARGIN;
      } else {
        width = Math.min(panelMaxWidth, vw - 2 * MARGIN);
        left = r.right - width;
        if (left < MARGIN) left = MARGIN;
        if (left + width > vw - MARGIN) {
          left = Math.max(MARGIN, vw - MARGIN - width);
        }
      }

      const top = r.bottom + 6;
      const rawMax = viewportBottom - top - MARGIN;
      const maxHeight = Math.max(120, Math.min(520, rawMax));

      setStyle({
        position: "fixed",
        top,
        left,
        width,
        maxHeight,
        zIndex: 110,
      });
    };

    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
      queueMicrotask(() => {
        setStyle(undefined);
      });
    };
  }, [open, anchorRef, panelMaxWidth, matchAnchorWidth]);

  if (!open) return undefined;
  return style ?? fallbackPlacement(panelMaxWidth, matchAnchorWidth);
}
