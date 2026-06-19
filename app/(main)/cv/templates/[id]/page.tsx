import type { Metadata } from "next";

import CvTemplatePreviewClient from "./CvTemplatePreviewClient";

export const metadata: Metadata = {
  title: "Xem mẫu CV",
  description: "Xem trước mẫu CV trước khi tạo hồ sơ.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CvTemplatePreviewPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="min-h-[calc(100vh-5rem)] overflow-x-hidden bg-[#f3f5f7] px-3 py-8 sm:px-4 sm:py-10">
      <div className="mx-auto min-w-0 max-w-5xl">
        <CvTemplatePreviewClient templateId={Number(id)} />
      </div>
    </div>
  );
}
