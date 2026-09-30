"use client";

import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { aiService } from "@/services/ai.service";
import { getErrorToastMessage } from "@/lib/submit-error";
import { toast } from "sonner";
import { useState } from "react";

export default function JobAiQuestions({
  jobTitle,
  companyName,
  jobDescription,
  skills,
}: {
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
  skills?: string[];
}) {
  const [questions, setQuestions] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await aiService.jobQuestions({
        language: "vi",
        jobTitle,
        companyName,
        jobDescription,
        skills: (skills ?? []).slice(0, 20),
      });
      return res.suggestions;
    },
    onSuccess: (items) => {
      setQuestions(items);
    },
    onError: (err: unknown) => {
      toast.error(getErrorToastMessage(err) || "Không thể tạo gợi ý câu hỏi");
    },
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="h-6 w-1 rounded-full bg-[#00b14f]" />
          Gợi ý câu hỏi cho nhà tuyển dụng
        </h2>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-[#00b14f]/25 bg-[#00b14f]/5 px-4 py-2 text-sm font-semibold text-[#00b14f] transition hover:bg-[#00b14f]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Tạo gợi ý
            </>
          )}
        </button>
      </div>

      {questions.length ? (
        <ul className="mt-4 space-y-2">
          {questions.map((q, i) => (
            <li
              key={i}
              className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm leading-relaxed text-gray-800"
            >
              {q}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Nhấn “Tạo gợi ý” để nhận danh sách câu hỏi giúp bạn hiểu rõ phạm vi công
          việc, kỳ vọng, quy trình và cơ hội phát triển trước khi ứng tuyển hoặc
          phỏng vấn.
        </p>
      )}
    </div>
  );
}

