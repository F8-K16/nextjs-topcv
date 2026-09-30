export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderBlogHtml(content: string) {
  const escaped = escapeHtml(content.trim());
  const withInline = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return withInline
    .split(/\n{2,}/)
    .map((block) => {
      const html = block.replace(/\n/g, "<br />");
      if (html.startsWith("## ")) {
        return `<h2 class="mt-6 text-lg font-semibold text-zinc-900">${html.slice(3)}</h2>`;
      }
      return `<p class="mt-3 text-sm leading-relaxed text-zinc-700">${html}</p>`;
    })
    .join("");
}
