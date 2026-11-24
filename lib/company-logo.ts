const DEFAULT_LOGO = "/images/logo-default.png";

/** next/image throws on values like "N/A" and takes the whole list down with it. */
export function companyLogoSrc(src?: string | null): string {
  const value = src?.trim() ?? "";
  if (!value) return DEFAULT_LOGO;
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    return DEFAULT_LOGO;
  }
  return DEFAULT_LOGO;
}
