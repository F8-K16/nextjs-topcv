import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CV công khai",
  description: "Liên kết CV công khai (chuyển hướng sang trang xem CV).",
};

type Props = {
  params: Promise<{ cvId: string }>;
};

export default async function PublicCvPageLegacy({ params }: Props) {
  const { cvId } = await params;
  redirect(`/resumes/shared/${cvId}`);
}
