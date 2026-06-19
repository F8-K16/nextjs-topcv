import { z } from "zod";
import {
  EXPERIENCE_OPTIONS,
  JOB_MODERATION_OPTIONS,
  JOB_TYPE_OPTIONS,
} from "../types/job.type";

const MODERATION = JOB_MODERATION_OPTIONS.map((o) => o.value) as [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const JOB_TYPES = JOB_TYPE_OPTIONS.map((item) => item.value) as [
  "FULL_TIME",
  "PART_TIME",
  "FREELANCE",
];

const EXPERIENCE_LEVELS = EXPERIENCE_OPTIONS.map((item) => item.value) as [
  "INTERN",
  "FRESHER",
  "JUNIOR",
  "MIDDLE",
  "SENIOR",
  "LEAD",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function assertDeadlineAtLeastOneDayFromNow(
  data: { deadline?: string },
  ctx: z.RefinementCtx,
) {
  if (data.deadline == null || data.deadline === "") return;
  const t = new Date(data.deadline).getTime();
  if (Number.isNaN(t)) return;
  if (t < Date.now() + MS_PER_DAY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Hạn nộp hồ sơ phải cách thời điểm hiện tại ít nhất 1 ngày (24 giờ).",
      path: ["deadline"],
    });
  }
}

const jobFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề tối đa 255 ký tự"),

  description: z.string().trim().min(1, "Mô tả không được để trống"),

  minSalary: z
    .union([z.coerce.number(), z.nan()])
    .optional()
    .transform((val) => (Number.isNaN(val) ? undefined : val)),

  maxSalary: z
    .union([z.coerce.number(), z.nan()])
    .optional()
    .transform((val) => (Number.isNaN(val) ? undefined : val)),

  quantity: z.coerce
    .number()
    .int("Số lượng phải là số nguyên")
    .min(1, "Số lượng phải lớn hơn 0"),

  jobType: z.enum(JOB_TYPES, {
    message:
      "Vui lòng chôn hình thức làm việc",
  }),

  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    message: "Vui lòng chọn kinh nghiệm cho vị trí này",
  }),

  companyId: z.coerce.number().int().min(1, "Vui lòng chọn công ty"),

  categoryId: z.coerce.number().int().min(1, "Vui lòng chọn danh mục"),

  employerId: z.coerce.number().int().optional(),

  moderationStatus: z.enum(MODERATION).optional(),

  deadline: z
    .union([z.string(), z.undefined()])
    .optional()
    .transform((s) => {
      if (s == null || String(s).trim() === "") return undefined;
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    }),

  workLocation: z
    .string()
    .max(500, "Địa điểm làm việc tối đa 500 ký tự")
    .optional()
    .transform((s) => (s?.trim() === "" ? undefined : s)),

  isFeatured: z.boolean().optional(),

  skillIds: z.array(z.number().int().positive()).max(50).optional(),
});

function withSalaryRefines<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
  return schema
    .refine(
      (data) => {
        const min = data.minSalary;
        if (typeof min === "number" && min < 0) return false;
        return true;
      },
      {
        path: ["minSalary"],
        message:
          "Lương tối thiểu không hợp lệ",
      },
    )
    .refine(
      (data) => {
        const max = data.maxSalary;
        if (typeof max === "number" && max < 0) return false;
        return true;
      },
      {
        path: ["maxSalary"],
        message: "Lương tối đa không hợp lệ",
      },
    )
    .refine(
      (data) => {
        const min = data.minSalary;
        const max = data.maxSalary;
        if (typeof min === "number" && typeof max === "number") {
          return min <= max;
        }
        return true;
      },
      {
        path: ["maxSalary"],
        message:
          "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu",
      },
    );
}

export const createJobSchema = withSalaryRefines(jobFieldsSchema).superRefine(
  assertDeadlineAtLeastOneDayFromNow,
);

export const updateJobSchema = withSalaryRefines(
  jobFieldsSchema.partial(),
).superRefine(assertDeadlineAtLeastOneDayFromNow);

const employerJobFieldsBase = jobFieldsSchema.omit({
  companyId: true,
  employerId: true,
  moderationStatus: true,
  isFeatured: true,
});

export const employerJobFormSchema = withSalaryRefines(
  employerJobFieldsBase,
).superRefine(assertDeadlineAtLeastOneDayFromNow);

export const employerJobFormUpdateSchema = withSalaryRefines(
  employerJobFieldsBase.partial(),
).superRefine(assertDeadlineAtLeastOneDayFromNow);
