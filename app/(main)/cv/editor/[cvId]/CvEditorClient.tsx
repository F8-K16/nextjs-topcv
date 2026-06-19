"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  GC_DEFAULT_MS,
  STALE_CV_DETAIL_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { cvService } from "@/services/cv.service";
import type { Cv, CvContent } from "@/app/types/cv.type";
import { buildEmptyContent, getByPath, setByPath } from "@/lib/cv-content";
import { requestAppConfirm } from "@/app/stores/confirm-dialog.store";
import CvCanvas from "../../_components/CvCanvas";
import EditorSectionsPanel from "./EditorSectionsPanel";
import AiSuggestSummaryModal from "./AiSuggestSummaryModal";
import { aiService } from "@/services/ai.service";
import { API_BASE_URL } from "@/lib/api-base-url";
import { getErrorToastMessage } from "@/lib/submit-error";

type Props = { cvId: number };

const formatTime = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
};

export default function CvEditorClient({ cvId }: Props) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAuthed = Boolean(user?.id);

  const { data: cv, isLoading, isError } = useQuery({
    queryKey: ["cv", cvId],
    queryFn: () => cvService.getCv(cvId),
    enabled: isAuthed && Number.isFinite(cvId),
    staleTime: STALE_CV_DETAIL_MS,
    gcTime: GC_DEFAULT_MS,
    refetchOnMount: false,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<CvContent>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const lastSavedRef = useRef<{ title: string; content: string } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPayloadRef = useRef<{
    title?: string;
    content?: CvContent;
  } | null>(null);

  useEffect(() => {
    if (!cv) return;
    setTitle(cv.title);
    setContent(cv.content as CvContent);
    setSavedAt(cv.lastEditedAt ?? cv.updatedAt);
    lastSavedRef.current = {
      title: cv.title,
      content: JSON.stringify(cv.content ?? {}),
    };
  }, [cv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = async (override?: {
    title?: string;
    content?: CvContent;
    status?: "DRAFT" | "COMPLETED";
  }) => {
    if (!cv) return null;
    const payload = {
      ...(pendingPayloadRef.current ?? {}),
      ...(override ?? {}),
    };
    if (
      payload.title === undefined &&
      payload.content === undefined &&
      payload.status === undefined
    ) {
      return null;
    }
    pendingPayloadRef.current = null;
    setIsSaving(true);
    try {
      const updated = await cvService.updateCv(cv.id, payload);
      lastSavedRef.current = {
        title: updated.title,
        content: JSON.stringify(updated.content ?? {}),
      };
      setSavedAt(updated.lastEditedAt ?? updated.updatedAt);
      queryClient.setQueryData(["cv", cv.id], updated);
      queryClient.invalidateQueries({ queryKey: ["my-cvs"] });
      return updated;
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleSave = (next: { title?: string; content?: CvContent }) => {
    pendingPayloadRef.current = {
      ...(pendingPayloadRef.current ?? {}),
      ...next,
    };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persist().catch(() => {
        toast.error("Tự lưu nháp thất bại");
      });
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (pendingPayloadRef.current && cv) {
        const data = pendingPayloadRef.current;
        const url = `${API_BASE_URL}/cvs/${cv.id}`;
        try {
          const blob = new Blob([JSON.stringify(data)], {
            type: "application/json",
          });
          if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon(url, blob);
          }
        } catch {
          /* ignore */
        }
      }
    };
  }, [cv?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const dirty = pendingPayloadRef.current !== null;
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleTitleChange = (next: string) => {
    setTitle(next);
    scheduleSave({ title: next });
  };

  const handleContentChange = (next: CvContent) => {
    setContent(next);
    scheduleSave({ content: next });
  };

  const getString = (path: string) => {
    const v = getByPath(content, path);
    return typeof v === "string" ? v : "";
  };

  const extractList = (path: string): Array<Record<string, unknown>> => {
    const v = getByPath(content, path);
    return Array.isArray(v) ? (v as Array<Record<string, unknown>>) : [];
  };

  const requestAiSummary = async () => {
    setAiOpen(true);
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const skills = extractList("skills")
        .map((x) => (typeof x.name === "string" ? x.name.trim() : ""))
        .filter(Boolean)
        .slice(0, 25);

      const experiences = extractList("experience").slice(0, 5).map((x) => {
        const title =
          typeof x.title === "string"
            ? x.title
            : typeof x.position === "string"
              ? x.position
              : undefined;
        const company = typeof x.company === "string" ? x.company : undefined;
        const desc =
          typeof x.description === "string"
            ? x.description
            : typeof x.summary === "string"
              ? x.summary
              : "";
        const highlights = desc
          .split(/\n+/)
          .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
          .filter(Boolean)
          .slice(0, 6);
        return { title, company, highlights };
      });

      const profileTitle = getString("profile.title") || title;
      const currentText = getString("summary.text");

      const res = await aiService.cvSuggest({
        section: "summary",
        language: "vi",
        tone: "professional",
        profileTitle,
        currentText,
        skills,
        experiences,
      });
      setAiSuggestions(res.suggestions ?? []);
    } catch (e: unknown) {
      toast.error(getErrorToastMessage(e) || "Không thể tạo gợi ý AI");
      setAiOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSummary = (text: string) => {
    const next = setByPath(content, "summary.text", text);
    handleContentChange(next as CvContent);
    setAiOpen(false);
    toast.success("Đã áp dụng gợi ý vào phần Giới thiệu");
  };

  const completeMutation = useMutation({
    mutationFn: () =>
      persist({ status: "COMPLETED", title, content }).then((r) => {
        if (!r) throw new Error("No CV");
        return cvService.updateCv(r.id, { status: "COMPLETED" });
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["cv", cvId], updated);
      queryClient.invalidateQueries({ queryKey: ["my-cvs"] });
      toast.success("Đã lưu hoàn tất CV");
    },
    onError: () => {
      toast.error("Không thể lưu hoàn tất");
    },
  });

  const handleResetContent = async () => {
    if (!cv) return;
    const ok = await requestAppConfirm({
      title: "Xóa toàn bộ nội dung?",
      description:
        "Xóa toàn bộ nội dung đã nhập và giữ nguyên cấu trúc mẫu? Hành động không thể hoàn tác.",
      confirmLabel: "Xóa nội dung",
      variant: "destructive",
    });
    if (!ok) return;
    const empty = buildEmptyContent(cv.template.templateData);
    setContent(empty);
    scheduleSave({ content: empty });
  };

  const handleSaveDraftNow = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    pendingPayloadRef.current = {
      ...(pendingPayloadRef.current ?? {}),
      title,
      content,
    };
    try {
      await persist();
      toast.success("Đã lưu nháp");
    } catch {
      toast.error("Lưu nháp thất bại");
    }
  };

  const cvSnapshot = useMemo<Cv | null>(() => {
    if (!cv) return null;
    return { ...cv, title, content };
  }, [cv, title, content]);

  if (!isAuthed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-slate-600">
          Vui lòng đăng nhập để chỉnh sửa CV.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-[#00b14f] px-4 text-sm font-semibold text-white"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-[#00b14f]" />
      </div>
    );
  }

  if (isError || !cv || !cvSnapshot) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-red-700">
        Không tìm thấy CV.{" "}
        <Link href="/cv/my" className="font-semibold underline">
          Quay lại CV của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-5 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:flex-row lg:px-6">
      <aside className="w-full min-w-0 lg:w-72 lg:shrink-0">
        <div className="space-y-4 lg:sticky lg:top-24">
          <Link
            href="/cv/my"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#00b14f]"
          >
            <ArrowLeft className="h-4 w-4" /> CV của tôi
          </Link>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tiêu đề CV
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#00b14f] focus:outline-none focus:ring-2 focus:ring-[#00b14f]/15"
              placeholder="Ví dụ: CV Frontend Developer"
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              {isSaving ? (
                <span className="inline-flex items-center gap-1 text-slate-700">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang lưu…
                </span>
              ) : savedAt ? (
                <span>Đã lưu nháp lúc {formatTime(savedAt)}</span>
              ) : (
                <span>Chưa lưu</span>
              )}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              Trạng thái:{" "}
              {cv.status === "COMPLETED" ? "Hoàn tất" : "Bản nháp"}
            </div>

            <button
              type="button"
              onClick={() => void requestAiSummary()}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#00b14f]/10 text-sm font-semibold text-[#00b14f] hover:bg-[#00b14f]/15"
            >
              <Sparkles className="h-4 w-4" /> AI gợi ý Giới thiệu
            </button>
          </div>

          <EditorSectionsPanel
            templateData={cv.template.templateData}
            content={content}
            onContentChange={handleContentChange}
          />

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSaveDraftNow}
              disabled={isSaving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> Lưu nháp
            </button>
            <button
              type="button"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#00b14f] text-sm font-semibold text-white shadow-sm hover:bg-[#009944] disabled:opacity-60"
            >
              {completeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Lưu hoàn tất
            </button>
            <button
              type="button"
              onClick={() => void handleResetContent()}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Xóa toàn bộ nội dung
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-auto">
        <div className="rounded-2xl bg-slate-100/60 p-2 sm:p-6 md:p-10">
          <CvCanvas
            templateData={cv.template.templateData}
            content={content}
            onContentChange={handleContentChange}
          />
        </div>
      </main>

      <AiSuggestSummaryModal
        open={aiOpen}
        loading={aiLoading}
        suggestions={aiSuggestions}
        onClose={() => setAiOpen(false)}
        onSelect={applyAiSummary}
      />
    </div>
  );
}
