"use client";

import { useMemo } from "react";
import {
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import type {
  CvContent,
  CvTemplateBlock,
  CvTemplateData,
  CvTemplateSection,
} from "@/app/types/cv.type";
import {
  createSectionItem,
  getByPath,
  getSectionItems,
  orderTemplateSections,
  setByPath,
} from "@/lib/cv-content";
import { cn } from "@/lib/utils";

import InlineEditableText from "./InlineEditableText";

type CanvasProps = {
  templateData: CvTemplateData;
  content: CvContent;
  readOnly?: boolean;
  onContentChange?: (next: CvContent) => void;
};

const sectionIcon: Record<string, React.ReactNode> = {
  experience: <Briefcase className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  skills: <Sparkles className="h-4 w-4" />,
};

const themeStyles = {
  green: {
    headerBg: "bg-[#00b14f]",
    accent: "text-[#00b14f]",
    accentBorder: "border-[#00b14f]",
  },
  slate: {
    headerBg: "bg-slate-800",
    accent: "text-slate-700",
    accentBorder: "border-slate-700",
  },
} as const;

const variantStyles = {
  classic: {
    container: "bg-white",
    header: "text-white",
    body: "space-y-4 px-4 py-4 text-slate-800 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle: "text-sm font-semibold uppercase tracking-wide",
    sectionItem:
      "group/item rounded-md border border-transparent p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200/70 hover:bg-slate-50/50 hover:shadow-sm",
  },
  executive: {
    container: "bg-white",
    header: "text-slate-900",
    body: "grid grid-cols-1 gap-4 bg-slate-50/50 px-4 py-4 text-slate-800 sm:gap-5 sm:px-6 sm:py-6 md:grid-cols-2",
    sectionTitle:
      "text-xs font-bold uppercase tracking-[0.16em]",
    sectionItem:
      "group/item rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
  },
  creative: {
    container: "bg-white",
    header: "text-white",
    body: "space-y-4 bg-linear-to-b from-slate-50 to-white px-4 py-4 text-slate-800 sm:space-y-5 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle: "text-sm font-semibold uppercase tracking-wide",
    sectionItem:
      "group/item rounded-xl border border-slate-200/70 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
  },
  minimal: {
    container: "bg-white",
    header: "text-slate-900 border-b border-slate-200",
    body: "space-y-3 px-4 py-4 text-slate-800 sm:space-y-4 sm:px-6 sm:py-6",
    sectionTitle:
      "text-xs font-semibold uppercase tracking-wider text-slate-500",
    sectionItem:
      "group/item py-2 border-b border-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50/70",
  },
  modernCard: {
    container: "bg-slate-50",
    header: "text-white bg-slate-900",
    body: "space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6",
    sectionTitle: "text-sm font-semibold text-slate-700",
    sectionItem:
      "group/item rounded-xl bg-white p-4 shadow-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
  },
  gradient: {
    container: "bg-white",
    header: "text-white",
    body: "space-y-4 px-4 py-4 text-slate-800 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle: "text-sm font-bold uppercase tracking-wide text-indigo-600",
    sectionItem:
      "group/item rounded-xl border border-indigo-100 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
  },
  compact: {
    container: "bg-white",
    header: "text-white",
    body: "space-y-3 px-4 py-4 text-sm text-slate-800 sm:px-5 sm:py-5",
    sectionTitle: "text-xs font-bold uppercase tracking-wide",
    sectionItem:
      "group/item rounded-md border border-slate-200 p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
  },
  dark: {
    container: "bg-[#0b1220] text-slate-100 ring-slate-700/80",
    header: "text-slate-100 border-b border-slate-700",
    body: "space-y-4 bg-[#0b1220] px-4 py-4 text-slate-200 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle: "text-sm font-semibold uppercase tracking-wide text-cyan-300",
    sectionItem:
      "group/item rounded-xl border border-slate-700 bg-slate-900/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-cyan-900/20",
  },
  timeline: {
    container: "bg-white",
    header: "text-slate-900",
    body: "space-y-4 px-4 py-4 text-slate-800 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle: "text-sm font-semibold uppercase tracking-wide",
    sectionItem:
      "group/item relative rounded-md border border-slate-200/90 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
  },
  newspaper: {
    container: "bg-[#fffef8]",
    header: "text-slate-900 border-b-2 border-slate-900",
    body: "space-y-3 px-4 py-4 text-slate-900 sm:space-y-4 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle:
      "text-xs font-bold uppercase tracking-[0.2em] text-slate-700",
    sectionItem:
      "group/item border-b border-dashed border-slate-300 pb-2 transition-all duration-200",
  },
  bold: {
    container: "bg-[#0f172a] text-slate-100 ring-indigo-700/60",
    header: "text-white",
    body: "space-y-4 px-4 py-4 text-slate-100 sm:space-y-6 sm:px-6 sm:py-5 md:px-8 md:py-6",
    sectionTitle: "text-sm font-bold uppercase tracking-wider text-fuchsia-300",
    sectionItem:
      "group/item rounded-xl border border-indigo-500/50 bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/30 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
  },
  softSidebar: {
    container: "bg-[#f8fafc]",
    header: "text-slate-800",
    body: "space-y-4 px-4 py-4 text-slate-800 sm:space-y-6 sm:px-6 sm:py-6",
    sectionTitle:
      "text-xs font-semibold uppercase tracking-[0.16em] text-sky-700",
    sectionItem:
      "group/item rounded-lg border border-sky-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
  },
} as const;
type VariantKey = keyof typeof variantStyles;
const DEFAULT_VARIANT: VariantKey = "classic";

const fontByVariant: Record<VariantKey, string> = {
  classic: "font-sans",
  executive: "font-serif",
  creative: "font-['Poppins']",
  minimal: "font-mono",
  modernCard: "font-sans",
  gradient: "font-sans",
  compact: "font-sans",
  dark: "font-sans",
  timeline: "font-sans",
  newspaper: "font-serif",
  bold: "font-sans",
  softSidebar: "font-sans",
};

const densityByMode = {
  comfortable: {
    bodySpacing: "space-y-6",
    sectionListSpacing: "space-y-3",
    sectionPadding: "p-2",
    sectionTitlePadding: "pb-1.5",
  },
  compact: {
    bodySpacing: "space-y-4",
    sectionListSpacing: "space-y-2",
    sectionPadding: "p-1.5",
    sectionTitlePadding: "pb-1",
  },
} as const;
type DensityKey = keyof typeof densityByMode;

const getStr = (content: CvContent, path: string) => {
  const v = getByPath(content, path);
  return typeof v === "string" ? v : "";
};

const findBlock = (
  templateData: CvTemplateData,
  bindingPath: string,
): CvTemplateBlock | undefined =>
  templateData.blocks?.find((b) => b.bindingPath === bindingPath);

const readVariantKey = (templateData: CvTemplateData): VariantKey => {
  const variantRaw = templateData.meta?.variant;
  if (typeof variantRaw !== "string") return DEFAULT_VARIANT;
  if (variantRaw in variantStyles) return variantRaw as VariantKey;
  return DEFAULT_VARIANT;
};

const readDensityKey = (templateData: CvTemplateData): DensityKey => {
  const densityRaw = templateData.meta?.density;
  return densityRaw === "compact" ? "compact" : "comfortable";
};

const renderHeaderStyle = (
  variantKey: VariantKey,
  theme: (typeof themeStyles)[keyof typeof themeStyles],
) => {
  if (variantKey === "gradient") {
    return "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";
  }
  if (variantKey === "minimal") {
    return "bg-white";
  }
  if (variantKey === "dark") {
    return "bg-[#111827]";
  }
  if (variantKey === "bold") {
    return "bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700";
  }
  if (variantKey === "newspaper") {
    return "bg-[#fffef8]";
  }
  if (variantKey === "softSidebar") {
    return "bg-linear-to-r from-sky-50 to-cyan-50 border-b border-sky-100";
  }
  if (variantKey === "executive") {
    return "border-b border-slate-200 bg-white";
  }
  if (variantKey === "creative") {
    return "bg-linear-to-r from-[#0f172a] via-[#334155] to-[#475569]";
  }
  return theme.headerBg;
};

export default function CvCanvas({
  templateData,
  content,
  readOnly = false,
  onContentChange,
}: CanvasProps) {
  const themeKey =
    (templateData.meta?.theme as string | undefined) === "slate"
      ? "slate"
      : "green";
  const theme = themeStyles[themeKey];
  const variantKey = readVariantKey(templateData);
  const variant = variantStyles[variantKey];
  const densityKey = readDensityKey(templateData);
  const density = densityByMode[densityKey];
  const rootFontClass = fontByVariant[variantKey];
  const isTwoColumnLayout = templateData.layout === "two-column";
  const isTimeline = variantKey === "timeline";
  const isDark = variantKey === "dark" || variantKey === "bold";
  const isNewspaper = variantKey === "newspaper";
  const isBold = variantKey === "bold";
  const isSoftSidebar = variantKey === "softSidebar";

  const updateField = (bindingPath: string, value: string) => {
    if (!onContentChange) return;
    const next = setByPath(content, bindingPath, value);
    onContentChange(next);
  };

  const updateSection = (
    section: CvTemplateSection,
    items: Record<string, string>[],
  ) => {
    if (!onContentChange) return;
    const next = setByPath(content, section.bindingPath, items);
    onContentChange(next);
  };

  const renderProfileBlock = (
    bindingPath: string,
    extraClass?: string,
    placeholder?: string,
  ) => {
    const block = findBlock(templateData, bindingPath);
    return (
      <InlineEditableText
        value={getStr(content, bindingPath)}
        readOnly={readOnly}
        multiline={block?.type === "multiline"}
        placeholder={placeholder ?? block?.defaultValue ?? ""}
        onCommit={(v) => updateField(bindingPath, v)}
        ariaLabel={bindingPath}
        className={extraClass}
      />
    );
  };

  const renderSection = (section: CvTemplateSection) => {
    const items = getSectionItems(content, section);
    const isSkills = section.id === "skills";
    const isProject = section.id === "projects";
    const useModernProjectCards = variantKey === "modernCard" && isProject;
    const skillsMinimal = variantKey === "minimal" && isSkills;
    const skillsModernTags = variantKey === "modernCard" && isSkills;

    const removeItem = (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      updateSection(section, next);
    };
    const addItem = () => {
      const next = [...items, createSectionItem(section)];
      updateSection(section, next);
    };
    const updateItem = (idx: number, key: string, value: string) => {
      const next = items.map((it, i) =>
        i === idx ? { ...it, [key]: value } : it,
      );
      updateSection(section, next);
    };

    if (isSkills) {
      if (skillsMinimal) {
        return (
          <section key={section.id} className="space-y-2">
            <div
              className={cn(
                "flex items-center gap-2 border-b",
                density.sectionTitlePadding,
                variant.sectionTitle,
                theme.accent,
                theme.accentBorder,
              )}
            >
              {sectionIcon[section.id] ?? <Sparkles className="h-4 w-4" />}
              {section.label}
            </div>
            <ul className="list-disc pl-5 text-sm">
              {items.map((item, idx) => (
                <li key={idx} className="text-slate-700">
                  <InlineEditableText
                    value={String(item.name ?? "")}
                    readOnly={readOnly}
                    placeholder="Kỹ năng"
                    onCommit={(v) => updateItem(idx, "name", v)}
                    ariaLabel={`${section.label} ${idx}`}
                  />
                </li>
              ))}
            </ul>
            {!readOnly ? (
              <button
                type="button"
                onClick={addItem}
                className={cn(
                  "rounded-md border border-dashed px-3 py-1 text-xs font-medium",
                  theme.accentBorder,
                  theme.accent,
                )}
              >
                + Thêm kỹ năng
              </button>
            ) : null}
          </section>
        );
      }

      return (
        <section key={section.id} className="space-y-2">
          <div
            className={cn(
              "flex items-center gap-2 border-b",
              density.sectionTitlePadding,
              variant.sectionTitle,
              theme.accent,
              theme.accentBorder,
            )}
          >
            {sectionIcon[section.id] ?? <Sparkles className="h-4 w-4" />}
            {section.label}
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => (
              <span
                key={idx}
                className={cn(
                  "group/item inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs",
                  skillsModernTags
                    ? "bg-[#0f172a] text-slate-100"
                    : isDark
                      ? "bg-slate-800 text-slate-100"
                      : "bg-slate-100 text-slate-700",
                )}
              >
                <InlineEditableText
                  value={String(item.name ?? "")}
                  readOnly={readOnly}
                  placeholder="Kỹ năng"
                  onCommit={(v) => updateItem(idx, "name", v)}
                  ariaLabel={`${section.label} ${idx}`}
                />
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    aria-label="Xóa kỹ năng"
                    className="ml-1 hidden text-slate-400 hover:text-red-500 group-hover/item:inline"
                  >
                    ×
                  </button>
                ) : null}
              </span>
            ))}
            {!readOnly ? (
              <button
                type="button"
                onClick={addItem}
                className={cn(
                  "rounded-full border border-dashed px-3 py-1 text-xs font-medium",
                  theme.accentBorder,
                  theme.accent,
                      isDark ? "hover:bg-slate-800/80" : "hover:bg-emerald-50",
                )}
              >
                + Thêm kỹ năng
              </button>
            ) : null}
          </div>
        </section>
      );
    }

    return (
      <section key={section.id} className="space-y-3">
        <div
          className={cn(
            "flex items-center gap-2 border-b",
            density.sectionTitlePadding,
            variant.sectionTitle,
            theme.accent,
            theme.accentBorder,
          )}
        >
          {sectionIcon[section.id] ?? <Briefcase className="h-4 w-4" />}
          {section.label}
        </div>

        <ul
          className={cn(
            density.sectionListSpacing,
            useModernProjectCards ? "grid gap-3 md:grid-cols-2" : "",
            isTimeline ? "relative ml-1 border-l-2 border-slate-200 pl-4" : "",
          )}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className={cn(
                variant.sectionItem,
                density.sectionPadding,
                useModernProjectCards ? "h-full" : "",
              )}
            >
              {isTimeline ? (
                <span className="absolute -left-[5px] mt-2 h-2.5 w-2.5 rounded-full bg-[#00b14f]" />
              ) : null}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {section.itemBlocks?.map((b) => {
                    const value = String(item[b.bindingPath] ?? "");
                    if (
                      b.bindingPath === "company" ||
                      b.bindingPath === "school"
                    ) {
                      return (
                        <div
                          key={b.id}
                          className={cn(
                            "text-sm font-semibold",
                            isDark ? "text-slate-100" : "text-slate-900",
                          )}
                        >
                          <InlineEditableText
                            value={value}
                            readOnly={readOnly}
                            placeholder={b.defaultValue}
                            onCommit={(v) => updateItem(idx, b.bindingPath, v)}
                            ariaLabel={`${section.label} ${idx} ${b.id}`}
                          />
                        </div>
                      );
                    }
                    if (b.bindingPath === "role" || b.bindingPath === "major") {
                      return (
                        <div key={b.id} className={cn("text-sm", theme.accent)}>
                          <InlineEditableText
                            value={value}
                            readOnly={readOnly}
                            placeholder={b.defaultValue}
                            onCommit={(v) => updateItem(idx, b.bindingPath, v)}
                            ariaLabel={`${section.label} ${idx} ${b.id}`}
                          />
                        </div>
                      );
                    }
                    if (b.bindingPath === "period") {
                      return (
                        <div
                          key={b.id}
                          className={cn(
                            "text-xs",
                            isDark ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          <InlineEditableText
                            value={value}
                            readOnly={readOnly}
                            placeholder={b.defaultValue}
                            onCommit={(v) => updateItem(idx, b.bindingPath, v)}
                            ariaLabel={`${section.label} ${idx} ${b.id}`}
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "mt-1 text-sm leading-relaxed",
                          isDark ? "text-slate-300" : "text-slate-700",
                        )}
                      >
                        <InlineEditableText
                          value={value}
                          readOnly={readOnly}
                          multiline={b.type === "multiline"}
                          placeholder={b.defaultValue}
                          onCommit={(v) => updateItem(idx, b.bindingPath, v)}
                          ariaLabel={`${section.label} ${idx} ${b.id}`}
                        />
                      </div>
                    );
                  })}
                </div>
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    aria-label="Xóa mục"
                    className="invisible mt-1 shrink-0 rounded p-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover/item:visible"
                  >
                    Xóa
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {!readOnly ? (
          <button
            type="button"
            onClick={addItem}
            className={cn(
              "rounded-md border border-dashed px-3 py-1.5 text-xs font-medium",
              theme.accentBorder,
              theme.accent,
              isDark ? "hover:bg-slate-800/80" : "hover:bg-emerald-50",
            )}
          >
            + Thêm mục
          </button>
        ) : null}
      </section>
    );
  };

  const sections = useMemo(
    () => orderTemplateSections(templateData.sections ?? [], content),
    [templateData.sections, content],
  );
  const sidebarSectionIds = new Set(["skills", "languages", "certifications"]);
  const sidebarSections = sections.filter((section) =>
    sidebarSectionIds.has(section.id),
  );
  const mainSections = sections.filter(
    (section) => !sidebarSectionIds.has(section.id),
  );

  const renderSummarySection = () => (
    <section className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 border-b",
          density.sectionTitlePadding,
          variant.sectionTitle,
          theme.accent,
          theme.accentBorder,
        )}
      >
        <User className="h-4 w-4" />
        Giới thiệu
      </div>
      <div className="text-sm leading-relaxed">
        {renderProfileBlock(
          "summary.text",
          "block",
          "Giới thiệu ngắn về bản thân, định hướng và thế mạnh…",
        )}
      </div>
    </section>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-205 overflow-hidden rounded-xl shadow-md ring-1 sm:rounded-2xl print:shadow-none",
        isDark ? "ring-slate-700/70" : "ring-slate-200/70",
        variant.container,
        rootFontClass,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-1 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6",
          isNewspaper ? "px-4 py-4 sm:px-6 sm:py-5" : "",
          isBold ? "items-center text-center" : "",
          variant.header,
          renderHeaderStyle(variantKey, theme),
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={cn(
              "hidden h-14 w-14 items-center justify-center rounded-full sm:flex",
              variantKey === "executive"
                ? "bg-slate-100 ring-1 ring-slate-200"
                : variantKey === "dark"
                  ? "bg-slate-800 ring-1 ring-slate-600"
                  : variantKey === "bold"
                    ? "bg-indigo-900/60 ring-1 ring-indigo-300/40"
                : "bg-white/20 ring-2 ring-white/40",
              isNewspaper ? "hidden" : "",
            )}
          >
            <User className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-tight sm:text-2xl">
              {renderProfileBlock("profile.fullName", "block")}
            </h2>
            <p
              className={cn(
                "mt-1 text-sm",
                variantKey === "executive" ? "text-slate-600" : "opacity-90",
                variantKey === "dark" ? "text-slate-300 opacity-100" : "",
                variantKey === "bold" ? "text-indigo-100 opacity-100" : "",
              )}
            >
              {renderProfileBlock("profile.title", "block")}
            </p>
            <div
              className={cn(
                "mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2",
                isNewspaper ? "mt-2 grid-cols-1 gap-1 sm:grid-cols-1" : "",
                isBold ? "sm:grid-cols-4" : "",
                variantKey === "executive" ? "text-slate-600" : "",
                variantKey === "dark" ? "text-slate-300" : "",
                variantKey === "bold" ? "text-indigo-100" : "",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 opacity-80" />
                {renderProfileBlock("profile.email")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 opacity-80" />
                {renderProfileBlock("profile.phone")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 opacity-80" />
                {renderProfileBlock("profile.address")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 opacity-80" />
                {renderProfileBlock("profile.website")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(variant.body, density.bodySpacing, isNewspaper ? "bg-[#fffef8]" : "")}>
        {isSoftSidebar && isTwoColumnLayout ? (
          <div className="grid gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className={cn("space-y-4 rounded-xl bg-sky-50/60 p-4", isDark ? "bg-slate-900/40" : "")}>
              {renderSummarySection()}
              {sidebarSections.map((section) => renderSection(section))}
            </div>
            <div className={cn("space-y-5")}>
              {mainSections.map((section) => renderSection(section))}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              density.bodySpacing,
              variantKey === "executive" && isTwoColumnLayout
                ? "grid gap-4 md:grid-cols-2 md:space-y-0"
                : isBold
                  ? "grid gap-4 md:grid-cols-2 md:space-y-0"
                  : "",
            )}
          >
            {isBold ? (
              <div className="md:col-span-2">
                <div className="rounded-xl border border-indigo-400/40 bg-indigo-900/20 p-4">
                  {renderSummarySection()}
                </div>
              </div>
            ) : (
              renderSummarySection()
            )}
            {sections.map((section) => renderSection(section))}
          </div>
        )}
      </div>
    </div>
  );
}
