import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tải CV lên",
  description: "Tải CV để nhà tuyển dụng dễ tìm thấy bạn hơn.",
};

export default function UploadResumePage() {
  redirect("/resumes/upload");
}
