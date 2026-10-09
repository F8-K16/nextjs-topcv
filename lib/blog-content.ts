export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function looksLikeHtml(content: string) {
  return /<\/?(p|h[1-6]|ul|ol|li|blockquote|strong|em|b|i|u|div|br|img|a|hr)\b/i.test(
    content.trim(),
  );
}

export function markdownLiteToHtml(content: string) {
  const escaped = escapeHtml(content.trim());
  const withInline = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return withInline
    .split(/\n{2,}/)
    .map((block) => {
      const html = block.replace(/\n/g, "<br />");
      if (html.startsWith("## ")) {
        return `<h2>${html.slice(3)}</h2>`;
      }
      return `<p>${html}</p>`;
    })
    .join("");
}

export function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|form|link|meta)[\s\S]*?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");
}

export function editorHtmlFromStored(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;
  return markdownLiteToHtml(trimmed);
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderBlogHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return sanitizeBlogHtml(trimmed);
  return markdownLiteToHtml(trimmed);
}

export const BLOG_ARTICLE_CLASS =
  "blog-article [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-zinc-700 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_li]:text-sm [&_blockquote]:mt-3 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-[#00b14f] [&_a]:underline [&_img]:mt-4 [&_img]:max-w-full [&_img]:rounded-xl [&_hr]:my-6 [&_hr]:border-zinc-200";
