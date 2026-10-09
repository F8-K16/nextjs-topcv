import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import type { CvTemplate } from "@/app/types/cv.type";
import { API_BASE_URL } from "@/lib/api-base-url";
import { cvTemplatePublicPath } from "@/lib/cv-template-path";
import { nextFetchCache } from "@/lib/next-fetch-cache";

import CvTemplatePreviewClient from "./CvTemplatePreviewClient";

async function getTemplate(key: string): Promise<CvTemplate | null> {
  const base = API_BASE_URL;
  const slug = key.trim();
  if (!base || !slug) return null;
  const res = await fetch(`${base}/cv/templates/${encodeURIComponent(slug)}`, {
    ...nextFetchCache.default,
  });
  if (res.status === 404 || !res.ok) return null;
  return res.json() as Promise<CvTemplate>;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) {
    return {
      title: "Xem mẫu CV",
      description: "Xem trước mẫu CV trước khi tạo hồ sơ.",
    };
  }
  return {
    title: `${template.name} · Mẫu CV`,
    description:
      template.description?.trim() || "Xem trước mẫu CV trước khi tạo hồ sơ.",
  };
}

export default async function CvTemplatePreviewPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  if (template.slug && template.slug !== slug) {
    redirect(cvTemplatePublicPath(template));
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#f3f5f7] px-3 py-8 sm:px-4 sm:py-10">
      <div className="mx-auto min-w-0 max-w-5xl">
        <CvTemplatePreviewClient templateKey={slug} />
      </div>
    </div>
  );
}
