"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MULTILINE_EDIT_MIN_FALLBACK_PX = 72;

type Props = {
  value: string;
  onCommit: (next: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  ariaLabel?: string;
};

export default function InlineEditableText({
  value,
  onCommit,
  multiline = false,
  placeholder,
  className,
  readOnly = false,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [multilineMinHeightPx, setMultilineMinHeightPx] = useState<
    number | null
  >(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const displayRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      try {
        inputRef.current.setSelectionRange(len, len);
      } catch {
        /*  */
      }
    }
  }, [editing]);

  /** Giữ chiều cao khớp vùng xem trước khi focus; khi gõ thì nới theo scrollHeight */
  useLayoutEffect(() => {
    if (!editing || !multiline) return;
    const el = inputRef.current;
    if (!el || !(el instanceof HTMLTextAreaElement)) return;
    const floor =
      multilineMinHeightPx != null && multilineMinHeightPx > 0
        ? multilineMinHeightPx
        : MULTILINE_EDIT_MIN_FALLBACK_PX;
    el.style.height = "auto";
    el.style.minHeight = `${floor}px`;
    el.style.height = `${Math.max(el.scrollHeight, floor)}px`;
  }, [editing, multiline, draft, multilineMinHeightPx]);

  const startEditing = () => {
    if (multiline && displayRef.current) {
      const h = Math.ceil(displayRef.current.getBoundingClientRect().height);
      setMultilineMinHeightPx(
        Math.max(h || 0, MULTILINE_EDIT_MIN_FALLBACK_PX),
      );
    } else {
      setMultilineMinHeightPx(null);
    }
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    if (draft !== value) onCommit(draft);
    setEditing(false);
    setMultilineMinHeightPx(null);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
    setMultilineMinHeightPx(null);
  };

  if (readOnly) {
    return (
      <span className={cn("whitespace-pre-line", className)}>
        {value || placeholder || ""}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        ref={multiline ? displayRef : undefined}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={startEditing}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startEditing();
          }
        }}
        className={cn(
          "inline-block min-w-[2ch] cursor-text whitespace-pre-line rounded px-0.5 -mx-0.5 hover:bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-200",
          !value && "text-slate-400 italic",
          className,
        )}
      >
        {value || placeholder || "Nhập nội dung…"}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={(el) => {
          inputRef.current = el;
        }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        rows={1}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "w-full resize-y overflow-hidden rounded border border-emerald-300 bg-transparent px-2 py-1 text-inherit placeholder:text-current/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300",
          className,
        )}
      />
    );
  }

  return (
    <input
      ref={(el) => {
        inputRef.current = el;
      }}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      }}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={cn(
        "w-full rounded border border-emerald-300 bg-transparent px-2 py-1 text-inherit placeholder:text-current/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300",
        className,
      )}
    />
  );
}
