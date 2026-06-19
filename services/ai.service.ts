import axiosClient from "@/lib/axios";

export type AiCvSuggestPayload = {
  section: "summary";
  language?: "vi" | "en";
  tone?: "professional" | "friendly" | "formal" | "concise";
  profileTitle?: string;
  currentText?: string;
  skills?: string[];
  experiences?: Array<{
    title?: string;
    company?: string;
    highlights?: string[];
  }>;
};

export type AiCvSuggestResponse = { suggestions: string[] };

export type AiApplyCoverLetterPayload = {
  language?: "vi" | "en";
  tone?: "professional" | "friendly" | "formal" | "concise";
  length?: "short" | "medium" | "long";
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
  skills?: string[];
  candidateHighlights?: string[];
};

export type AiApplyCoverLetterResponse = { text: string };

export type AiJobQuestionsPayload = {
  language?: "vi" | "en";
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
  skills?: string[];
};

export type AiJobQuestionsResponse = { suggestions: string[] };

export type AiCvReviewJobPayload = {
  language?: "vi" | "en";
  jobId: number;
  resumeId: number;
};

export type AiCvReviewJobResponse = {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  missingKeywords: string[];
  suggestedEdits: string[];
};

export const aiService = {
  async cvSuggest(payload: AiCvSuggestPayload): Promise<AiCvSuggestResponse> {
    const res = await axiosClient.post("/ai/cv/suggest", payload);
    return res.data as AiCvSuggestResponse;
  },
  async applyCoverLetter(
    payload: AiApplyCoverLetterPayload,
  ): Promise<AiApplyCoverLetterResponse> {
    const res = await axiosClient.post("/ai/apply/cover-letter", payload);
    return res.data as AiApplyCoverLetterResponse;
  },
  async jobQuestions(
    payload: AiJobQuestionsPayload,
  ): Promise<AiJobQuestionsResponse> {
    const res = await axiosClient.post("/ai/job/questions", payload);
    return res.data as AiJobQuestionsResponse;
  },
  async cvReviewJob(
    payload: AiCvReviewJobPayload,
  ): Promise<AiCvReviewJobResponse> {
    const res = await axiosClient.post("/ai/cv/review-job", payload);
    return res.data as AiCvReviewJobResponse;
  },
};
