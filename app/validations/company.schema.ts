import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Tên công ty không được để trống"),
  location: z.string().min(1, "Địa chỉ không được để trống"),
  description: z.string().max(2000, "Tối đa 2000 ký tự"),
  website: z
    .string()
    .trim()
    .refine((val) => !val || /^https?:\/\//.test(val), {
      message: "Website không hợp lệ",
    })
    .optional()
    .or(z.literal("")),
  logo: z
    .string()
    .trim()
    .refine((val) => !val || /^https?:\/\//.test(val), {
      message: "Logo không hợp lệ",
    })
    .optional()
    .or(z.literal("")),
  provinceId: z.number({
    error: "Vui lòng chọn tỉnh/thành",
  }),

  districtId: z.number({
    error: "Vui lòng chọn quận/huyện",
  }),
  categoryIds: z.array(z.number()).min(1, "Vui lòng chọn ít nhất 1 lĩnh vực"),
});

export const updateCompanySchema = z
  .object({
    name: z.string().min(1, "Tên công ty không được để trống"),
    description: z.string().max(2000, "Mô tả quá dài").optional(),
    location: z.string().min(1, "Địa chỉ không được để trống"),
    website: z
      .string()
      .trim()
      .refine((val) => !val || /^https?:\/\//.test(val), {
        message: "Website không hợp lệ",
      })
      .optional()
      .or(z.literal("")),
    logo: z
      .string()
      .trim()
      .refine((val) => !val || /^https?:\/\//.test(val), {
        message: "Logo không hợp lệ",
      })
      .optional()
      .or(z.literal("")),
    status: z.boolean(),
    provinceId: z.number({
      error: "Vui lòng chọn tỉnh/thành",
    }),

    districtId: z.number({
      error: "Vui lòng chọn quận/huyện",
    }),
    categoryIds: z.array(z.number()).min(1, "Vui lòng chọn ít nhất 1 lĩnh vực"),
  })
  .superRefine((data, ctx) => {
    if (data.districtId && !data.provinceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phải chọn tỉnh/thành trước khi chọn quận/huyện",
        path: ["districtId"],
      });
    }
    if (!data.categoryIds || data.categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn ít nhất 1 danh mục",
        path: ["categoryIds"],
      });
    }
  });
