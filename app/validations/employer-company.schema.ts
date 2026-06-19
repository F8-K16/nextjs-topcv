import { z } from "zod";

export const employerCompanyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nhập tên công ty")
    .max(500),
  description: z.string().optional(),
  location: z
    .string()
    .min(1, "Nhập địa chỉ / khu vực")
    .max(2000),
  website: z.string().optional(),
  logo: z.string().optional(),
  provinceId: z
    .number({ message: "Chọn tỉnh/thành" })
    .int()
    .min(1, "Chọn tỉnh/thành"),
  districtId: z
    .number({ message: "Chọn quận/huyện" })
    .int()
    .min(1, "Chọn quận/huyện"),
  categoryIds: z
    .array(z.number().int().positive())
    .min(
      1,
      "Chọn ít nhất một danh mục ngành cho công ty",
    ),
});

export type EmployerCompanyFormValues = z.infer<
  typeof employerCompanyFormSchema
>;
