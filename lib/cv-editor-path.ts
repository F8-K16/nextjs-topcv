export function cvEditorPath(cv: {
  id: number;
  template?: { slug?: string | null } | null;
}) {
  const slug = cv.template?.slug?.trim();
  if (slug) {
    return `/cv/editor/${encodeURIComponent(slug)}?cv=${cv.id}`;
  }
  return `/cv/editor/${cv.id}`;
}
