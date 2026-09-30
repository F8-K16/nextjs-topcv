import type {
  CvContent,
  CvTemplateData,
  CvTemplateSection,
} from "@/app/types/cv.type";

export const getByPath = (
  obj: unknown,
  path: string,
): unknown => {
  if (obj == null || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let cursor: unknown = obj;
  for (const key of parts) {
    if (cursor == null || typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
};

export const setByPath = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> => {
  const parts = path.split(".");
  const next = { ...obj };
  let cursor: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    const current = cursor[key];
    const isObject =
      current != null && typeof current === "object" && !Array.isArray(current);
    cursor[key] = isObject
      ? { ...(current as Record<string, unknown>) }
      : {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]!] = value;
  return next;
};

export const buildDefaultContent = (
  templateData: CvTemplateData,
): CvContent => {
  let content: CvContent = { meta: templateData.meta ?? {} };

  for (const block of templateData.blocks ?? []) {
    content = setByPath(content, block.bindingPath, block.defaultValue ?? "");
  }
  for (const section of templateData.sections ?? []) {
    const sampleItems = (section as CvTemplateSection & {
      sampleItems?: Record<string, string>[];
    }).sampleItems;
    if (Array.isArray(sampleItems) && sampleItems.length > 0) {
      content = setByPath(content, section.bindingPath, sampleItems.map((item) => ({ ...item })));
      continue;
    }
    if (section.defaultItem && Object.keys(section.defaultItem).length > 0) {
      content = setByPath(content, section.bindingPath, [{ ...section.defaultItem }]);
      continue;
    }
    const fallbackItem: Record<string, string> = {};
    for (const block of section.itemBlocks ?? []) {
      fallbackItem[block.bindingPath] = block.defaultValue ?? "";
    }
    content = setByPath(
      content,
      section.bindingPath,
      Object.keys(fallbackItem).length > 0 ? [fallbackItem] : [],
    );
  }
  return content;
};

export const buildEmptyContent = (
  templateData: CvTemplateData,
): CvContent => {
  let content: CvContent = { meta: templateData.meta ?? {} };

  for (const block of templateData.blocks ?? []) {
    content = setByPath(content, block.bindingPath, "");
  }
  for (const section of templateData.sections ?? []) {
    content = setByPath(content, section.bindingPath, []);
  }
  return content;
};

export const createSectionItem = (
  section: CvTemplateSection,
): Record<string, string> => {
  const item: Record<string, string> = {};
  if (section.defaultItem) {
    for (const [key, value] of Object.entries(section.defaultItem)) {
      item[key] = value ?? "";
    }
  } else if (section.itemBlocks) {
    for (const block of section.itemBlocks) {
      item[block.bindingPath] = block.defaultValue ?? "";
    }
  }
  return item;
};

export const getSectionItems = (
  content: CvContent,
  section: CvTemplateSection,
): Record<string, string>[] => {
  const value = getByPath(content, section.bindingPath);
  if (!Array.isArray(value)) return [];
  return value as Record<string, string>[];
};

/** Lưu trong JSON CV; không trùng bindingPath của template */
export const CV_SECTION_ORDER_KEY = "_sectionOrder";

export function normalizeSectionOrder(
  saved: unknown,
  templateSections: CvTemplateSection[],
): string[] {
  const defaultIds = templateSections.map((s) => s.id);
  const allowed = new Set(defaultIds);
  if (!Array.isArray(saved)) return [...defaultIds];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of saved) {
    const id = String(x);
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  for (const id of defaultIds) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

export function orderTemplateSections(
  templateSections: CvTemplateSection[],
  content: CvContent,
): CvTemplateSection[] {
  if (!templateSections.length) return [];
  const raw = (content as Record<string, unknown>)[CV_SECTION_ORDER_KEY];
  const order = normalizeSectionOrder(raw, templateSections);
  const byId = new Map(templateSections.map((s) => [s.id, s]));
  return order
    .map((id) => byId.get(id))
    .filter((s): s is CvTemplateSection => Boolean(s));
}
