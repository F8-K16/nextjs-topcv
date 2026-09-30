export function companyPublicPath(company: {
  id: number;
  slug?: string | null;
}) {
  const slug = company.slug?.trim();
  return `/companies/${slug || company.id}`;
}
