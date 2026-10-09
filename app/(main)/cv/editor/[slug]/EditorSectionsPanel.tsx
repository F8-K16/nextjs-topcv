"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import type {
  CvContent,
  CvTemplateData,
  CvTemplateSection,
} from "@/app/types/cv.type";
import {
  CV_SECTION_ORDER_KEY,
  createSectionItem,
  getSectionItems,
  orderTemplateSections,
  setByPath,
} from "@/lib/cv-content";

type Props = {
  templateData: CvTemplateData;
  content: CvContent;
  onContentChange: (next: CvContent) => void;
};

export default function EditorSectionsPanel({
  templateData,
  content,
  onContentChange,
}: Props) {
  const templateSections = templateData.sections ?? [];
  const orderedSections = orderTemplateSections(templateSections, content);
  const isTwoColumn = templateData.layout === "two-column";

  const updateSectionItems = (
    section: CvTemplateSection,
    items: Record<string, string>[],
  ) => {
    onContentChange(setByPath(content, section.bindingPath, items));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const ids = orderedSections.map((s) => s.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[index], next[j]] = [next[j]!, next[index]!];
    onContentChange(setByPath(content, CV_SECTION_ORDER_KEY, next));
  };

  const clearSectionOrder = () => {
    const next = { ...content } as Record<string, unknown>;
    delete next[CV_SECTION_ORDER_KEY];
    onContentChange(next as CvContent);
  };

  const hasCustomOrder = Array.isArray(
    (content as Record<string, unknown>)[CV_SECTION_ORDER_KEY],
  );

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Thứ tự các phần
      </h3>
      <p className="mt-1 hidden text-[11px] leading-snug text-slate-400 sm:block">
        {isTwoColumn
          ? "Mẫu hai cột: thứ tự áp dụng trong từng cột (trái: tóm tắt + phụ; phải: các phần chính)."
          : "Thứ tự hiển thị trên CV từ trên xuống."}
      </p>
      <ul className="mt-2 space-y-1">
        {orderedSections.map((section, index) => (
          <li
            key={section.id}
            className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5"
          >
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
              {section.label}
            </span>
            <button
              type="button"
              aria-label="Lên"
              disabled={index === 0}
              onClick={() => moveSection(index, -1)}
              className="shrink-0 rounded p-1 text-slate-500 hover:bg-white hover:text-slate-800 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Xuống"
              disabled={index === orderedSections.length - 1}
              onClick={() => moveSection(index, 1)}
              className="shrink-0 rounded p-1 text-slate-500 hover:bg-white hover:text-slate-800 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      {hasCustomOrder ? (
        <button
          type="button"
          onClick={clearSectionOrder}
          className="mt-2 text-[11px] font-medium text-slate-500 underline decoration-slate-300 hover:text-[#00b14f]"
        >
          Khôi phục thứ tự mặc định theo mẫu
        </button>
      ) : null}

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Các phần CV
      </h3>
      <ul className="mt-3 space-y-3">
        {orderedSections.map((section) => {
          const items = getSectionItems(content, section);
          return (
            <li key={section.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 text-sm font-medium text-slate-800">
                  {section.label}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ({items.length})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSectionItems(section, [
                      ...items,
                      createSectionItem(section),
                    ])
                  }
                  className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-md bg-[#00b14f]/10 px-2 py-1.5 text-xs font-semibold text-[#00b14f] hover:bg-[#00b14f]/15 sm:w-auto sm:justify-start sm:py-1"
                >
                  <Plus className="h-3 w-3" /> Thêm
                </button>
              </div>
              {items.length > 0 ? (
                <ul className="mt-1.5 space-y-1">
                  {items.map((item, idx) => {
                    const labelKey =
                      section.id === "skills"
                        ? "name"
                        : section.id === "education"
                          ? "school"
                          : "company";
                    const label = String(
                      item[labelKey] ??
                        item[Object.keys(item)[0] ?? ""] ??
                        "",
                    );
                    return (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600"
                      >
                        <span className="line-clamp-1">
                          {label || `Mục ${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSectionItems(
                              section,
                              items.filter((_, i) => i !== idx),
                            )
                          }
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Xóa"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">Chưa có mục nào</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
