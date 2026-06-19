import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  fileUrl: z.string().url("URL không hợp lệ"),
  candidateId: z.number("Vui lòng chọn ứng viên").int().positive(),
});

export const updateResumeSchema = createResumeSchema;
