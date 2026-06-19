import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export const signupSchema = z
  .object({
    username: z.string().min(1, "Tên không được để trống"),

    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không đúng định dạng"),

    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),

    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),

    phone: z
      .string()
      .min(1, "SĐT không được để trống")
      .transform((val) => val.replace(/[\s.-]/g, ""))
      .transform((val) => {
        if (val.startsWith("0")) return "+84" + val.slice(1);
        return val;
      })
      .refine((val) => /^\+84\d{9}$/.test(val), {
        message: "SĐT không hợp lệ (+84xxxxxxxxx)",
      }),

    agree: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý điều khoản",
    }),
    roles: z.array(z.string()).min(1, "Phải chọn ít nhất 1 vai trò"),
    companyName: z.string().optional(),
    location: z.string().optional(),
    provinceId: z.number().optional(),
    districtId: z.number().optional(),
    inviteToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const isEmployer = data.roles.includes("EMPLOYER");
      if (!isEmployer) return true;
      if (data.inviteToken?.trim()) return true;

      return !!(
        data.companyName?.trim() &&
        data.location?.trim() &&
        data.provinceId != null &&
        data.districtId != null
      );
    },
    {
      message: "Thiếu thông tin công ty",
      path: ["companyName"],
    },
  );

export const updateProfileSchema = z
  .object({
    username: z.string().min(1, "Tên không được để trống"),
    email: z.string().min(1, "Email không được để trống").email(),
    phone: z
      .string()
      .min(1, "SĐT không được để trống")
      .transform((val) => val.replace(/[\s.-]/g, ""))
      .transform((val) => {
        if (val.startsWith("0")) return "+84" + val.slice(1);
        return val;
      })
      .refine((val) => /^\+84\d{9}$/.test(val), {
        message: "SĐT không hợp lệ",
      }),
    avatar: z.string().optional(),
    provinceId: z.number().optional(),
    districtId: z.number().optional(),
    receiveEmailNotifications: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const hasP =
      data.provinceId != null && !Number.isNaN(Number(data.provinceId));
    const hasD =
      data.districtId != null && !Number.isNaN(Number(data.districtId));
    if (hasP !== hasD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Chọn đủ tỉnh/thành và quận/huyện, hoặc để trống cả hai",
        path: hasP ? ["districtId"] : ["provinceId"],
      });
    }
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
