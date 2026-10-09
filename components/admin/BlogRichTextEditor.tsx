"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";

import UploadButton from "@/components/UploadButton";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

export type BlogRichTextEditorHandle = {
  getHtml: () => string;
};

function ToolbarButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

export const BlogRichTextEditor = forwardRef<BlogRichTextEditorHandle, Props>(
  function BlogRichTextEditor({ value, onChange, disabled }, ref) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmitted = useRef(value);

  useImperativeHandle(ref, () => ({
    getHtml: () => editorRef.current?.innerHTML ?? "",
  }));

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    if (editor.innerHTML !== (value || "")) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => {
    const html = editorRef.current?.innerHTML ?? "";
    lastEmitted.current = html;
    onChange(html);
  };

  const run = (command: string, commandValue?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emit();
  };

  const setLink = () => {
    if (disabled) return;
    const url = window.prompt("Nhập URL liên kết", "https://");
    if (url === null) return;
    if (!url.trim()) {
      run("unlink");
      return;
    }
    run("createLink", url.trim());
  };

  const insertImage = (url: string) => {
    if (disabled || !url) return;
    editorRef.current?.focus();
    document.execCommand("insertImage", false, url);
    emit();
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900",
        disabled && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-1.5 py-1.5 dark:border-white/10 dark:bg-white/5">
        <ToolbarButton label="Hoàn tác" disabled={disabled} onClick={() => run("undo")}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Làm lại" disabled={disabled} onClick={() => run("redo")}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-white/15" />
        <ToolbarButton
          label="Đoạn văn"
          disabled={disabled}
          onClick={() => run("formatBlock", "p")}
        >
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Tiêu đề 2"
          disabled={disabled}
          onClick={() => run("formatBlock", "h2")}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Tiêu đề 3"
          disabled={disabled}
          onClick={() => run("formatBlock", "h3")}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-white/15" />
        <ToolbarButton label="In đậm" disabled={disabled} onClick={() => run("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="In nghiêng" disabled={disabled} onClick={() => run("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Gạch dưới"
          disabled={disabled}
          onClick={() => run("underline")}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Gạch ngang"
          disabled={disabled}
          onClick={() => run("strikeThrough")}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-white/15" />
        <ToolbarButton
          label="Danh sách"
          disabled={disabled}
          onClick={() => run("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Danh sách đánh số"
          disabled={disabled}
          onClick={() => run("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Trích dẫn"
          disabled={disabled}
          onClick={() => run("formatBlock", "blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-white/15" />
        <ToolbarButton label="Chèn liên kết" disabled={disabled} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Gỡ liên kết" disabled={disabled} onClick={() => run("unlink")}>
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
        <UploadButton
          signatureEndpoint="/api/sign-cloudinary-params"
          uploadPreset="F8_TopCV"
          options={{ tags: ["blog-content"] }}
          className={cn(
            "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10",
            disabled && "pointer-events-none opacity-40",
          )}
          onSuccess={(results: CloudinaryUploadWidgetResults) => {
            const info = results?.info;
            const url =
              typeof info === "object" && info !== null
                ? info.secure_url
                : undefined;
            if (url) insertImage(url);
          }}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center" title="Chèn ảnh">
            <ImagePlus className="h-4 w-4" />
          </span>
        </UploadButton>
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Nội dung bài viết"
        onInput={emit}
        onBlur={emit}
        onCompositionEnd={emit}
        className="min-h-[22rem] px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none empty:before:text-zinc-400 empty:before:content-['Viết_nội_dung_bài_viết…'] dark:text-zinc-100 dark:empty:before:text-zinc-500 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_img]:my-3 [&_img]:max-h-80 [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      />
    </div>
  );
  },
);

BlogRichTextEditor.displayName = "BlogRichTextEditor";
