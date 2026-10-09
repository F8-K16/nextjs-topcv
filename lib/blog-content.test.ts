import { describe, expect, it } from "vitest";

import {
  editorHtmlFromStored,
  htmlToPlainText,
  looksLikeHtml,
  renderBlogHtml,
  sanitizeBlogHtml,
} from "./blog-content";

describe("blog content", () => {
  it("keeps legacy markdown-lite posts as escaped html", () => {
    const html = renderBlogHtml("## Tiêu đề\n\nXin **chào**");
    expect(html).toContain("<h2>Tiêu đề</h2>");
    expect(html).toContain("<strong>chào</strong>");
    expect(html).not.toContain("<script");
  });

  it("renders stored html and strips script handlers", () => {
    expect(looksLikeHtml("<p>Hello</p>")).toBe(true);
    const html = renderBlogHtml(
      `<p onclick="alert(1)">Hi</p><script>alert(1)</script>`,
    );
    expect(html).toContain("<p>Hi</p>");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("<script");
  });

  it("loads legacy text into the editor as html", () => {
    expect(editorHtmlFromStored("## Mục")).toContain("<h2>Mục</h2>");
    expect(editorHtmlFromStored("<p>Sẵn HTML</p>")).toBe("<p>Sẵn HTML</p>");
  });

  it("plain-text helper ignores tags", () => {
    expect(htmlToPlainText("<p>Xin chào</p>")).toBe("Xin chào");
    expect(sanitizeBlogHtml(`<img src="javascript:alert(1)">`)).not.toContain(
      "javascript:",
    );
  });
});
