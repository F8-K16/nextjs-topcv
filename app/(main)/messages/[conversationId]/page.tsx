import type { Metadata } from "next";

import ConversationPageClient from "./ConversationPageClient";

export const metadata: Metadata = {
  title: "Cuộc trò chuyện",
  description: "Chi tiết tin nhắn với đối tác.",
};

export default function ConversationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ConversationPageClient />
    </div>
  );
}
