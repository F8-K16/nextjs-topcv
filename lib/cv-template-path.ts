export function cvTemplatePublicPath(template: {
  id: number;
  slug?: string | null;
}) {
  const slug = template.slug?.trim();
  return `/cv/templates/${slug || template.id}`;
}
