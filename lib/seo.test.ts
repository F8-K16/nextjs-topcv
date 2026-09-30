import { describe, expect, it } from "vitest";
import { readPublicFeatures } from "./public-features";
import { buildJobPostingJsonLd } from "./job-posting";

describe("readPublicFeatures", () => {
  it("hides AI and search controls when metadata does not enable them", () => {
    expect(readPublicFeatures(null)).toEqual({ ai: false, opensearch: false });
    expect(readPublicFeatures({ features: { ai: false, opensearch: false } })).toEqual({
      ai: false,
      opensearch: false,
    });
    expect(readPublicFeatures({ features: { ai: true, opensearch: true } })).toEqual({
      ai: true,
      opensearch: true,
    });
  });
});

describe("buildJobPostingJsonLd", () => {
  it("builds schema.org JobPosting for Google for Jobs", () => {
    const json = buildJobPostingJsonLd(
      {
        id: 12,
        slug: "backend-dev",
        title: "Backend Developer",
        description: "<p>Xây dựng API</p>",
        createdAt: "2026-09-01T00:00:00.000Z",
        deadline: "2026-10-01T00:00:00.000Z",
        jobType: "FULL_TIME",
        experienceLevel: "JUNIOR",
        minSalary: 15000000,
        maxSalary: 25000000,
        workLocation: "Hà Nội: Cầu Giấy",
        company: { name: "F8", website: "https://example.com" },
      },
      "https://nextcv.io.vn",
    );
    expect(json["@type"]).toBe("JobPosting");
    expect(json.title).toBe("Backend Developer");
    expect(json.description).toBe("Xây dựng API");
    expect(json.url).toBe("https://nextcv.io.vn/jobs/backend-dev");
    expect(json.employmentType).toBe("FULL_TIME");
    expect(json.validThrough).toBe("2026-10-01T00:00:00.000Z");
    expect(json.jobLocation).toMatchObject({
      "@type": "Place",
      address: { addressCountry: "VN", addressLocality: "Hà Nội: Cầu Giấy" },
    });
  });
});
