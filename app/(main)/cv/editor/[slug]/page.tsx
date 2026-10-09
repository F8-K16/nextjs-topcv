import type { Metadata } from "next";

import CvEditorClient from "./CvEditorClient";

export const metadata: Metadata = {
  title: "Soạn thảo CV",
  description: "Chỉnh sửa nội dung CV theo từng mục.",
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cv?: string }>;
};

export default async function CvEditorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { cv } = await searchParams;
  const cvFromQuery = Number(cv);
  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#f3f5f7]">
      <CvEditorClient
        slug={slug}
        cvId={Number.isFinite(cvFromQuery) && cvFromQuery > 0 ? cvFromQuery : undefined}
      />
    </div>
  );
}
