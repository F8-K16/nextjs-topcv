import type { Metadata } from "next";

import CvEditorClient from "./CvEditorClient";

export const metadata: Metadata = {
  title: "Soạn thảo CV",
  description: "Chỉnh sửa nội dung CV theo từng mục.",
};

type Props = {
  params: Promise<{ cvId: string }>;
};

export default async function CvEditorPage({ params }: Props) {
  const { cvId } = await params;
  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#f3f5f7]">
      <CvEditorClient cvId={Number(cvId)} />
    </div>
  );
}
