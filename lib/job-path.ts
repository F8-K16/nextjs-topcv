export function jobPublicPath(job: { id: number; slug?: string | null }) {
  const slug = job.slug?.trim();
  return `/jobs/${slug || job.id}`;
}
