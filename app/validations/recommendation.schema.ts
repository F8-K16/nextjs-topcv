import { z } from "zod";

export const recommendationFormSchema = z
  .object({
    desiredMinSalary: z.number().int().min(0).optional(),
    desiredMaxSalary: z.number().int().min(0).optional(),
    jobType: z.string().optional(),
    experienceLevel: z.string().optional(),
    preferredProvinceId: z.union([z.number().int().positive(), z.literal("")]),
    preferredDistrictId: z.union([z.number().int().positive(), z.literal("")]),
    isOpenToRemote: z.boolean(),
    skillIds: z.array(z.number().int().positive()).max(50),
    categoryIds: z.array(z.number().int().positive()).max(50),
  })
  .refine(
    (d) =>
      d.desiredMinSalary == null ||
      d.desiredMaxSalary == null ||
      d.desiredMinSalary <= d.desiredMaxSalary,
    {
      path: ["desiredMinSalary"],
      message: "Mức lương tối thiểu không được lớn hơn tối đa",
    },
  )
  .refine(
    (d) =>
      !(d.preferredDistrictId !== "" && d.preferredProvinceId === ""),
    {
      path: ["preferredProvinceId"],
      message: "Cần chọn tỉnh/thành khi chọn quận/huyện",
    },
  );

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;
