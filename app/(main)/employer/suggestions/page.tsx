import type { Metadata } from "next";

import EmployerSuggestionsPageClient from "./EmployerSuggestionsPageClient";

export const metadata: Metadata = {
  title: "Gợi ý ứng viên",
  description: "Ứng viên phù hợp với tin đăng của bạn.",
};

export default function EmployerSuggestionsPage() {
  return <EmployerSuggestionsPageClient />;
}
