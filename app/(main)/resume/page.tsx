import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CV của tôi",
  description: "Quản lý và cập nhật CV trên TopCV.",
};

export default function ResumePage() {
  redirect("/resumes");
}
