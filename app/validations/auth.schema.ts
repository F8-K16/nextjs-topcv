import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

// ─── Shared base fields ────────────────────────────────────────────────────

const baseFields = z.object({
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
});

// ─── Candidate schema ───────────────────────────────────────────────────────

export const candidateSignupSchema = baseFields
  .extend({
    roles: z.array(z.string()).default(["CANDIDATE"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

/** Input type (for useForm) — roles is optional since it has .default() */
export type CandidateSignupFormData = z.input<typeof candidateSignupSchema>;

// ─── Employer schema ────────────────────────────────────────────────────────

export const employerSignupSchema = baseFields
  .extend({
    roles: z.array(z.string()).default(["EMPLOYER"]),
    joinMode: z.enum(["new_company", "invite"]).default("new_company"),
    companyName: z.string().optional(),
    location: z.string().optional(),
    provinceId: z.number().optional(),
    districtId: z.number().optional(),
    inviteToken: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.joinMode === "invite") {
      if (!data.inviteToken?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập mã giới thiệu",
          path: ["inviteToken"],
        });
      }
    } else {
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tên công ty không được để trống",
          path: ["companyName"],
        });
      }
      if (!data.location?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Địa chỉ không được để trống",
          path: ["location"],
        });
      }
      if (data.provinceId == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn tỉnh/thành",
          path: ["provinceId"],
        });
      }
      if (data.districtId == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn quận/huyện",
          path: ["districtId"],
        });
      }
    }
  });

/** Input type (for useForm) — roles/joinMode optional since they have .default() */
export type EmployerSignupFormData = z.input<typeof employerSignupSchema>;

// ─── Legacy (kept for residual imports) ───────────────────────────────────

/** @deprecated Use candidateSignupSchema or employerSignupSchema */
export const signupSchema = baseFields
  .extend({
    roles: z.array(z.string()).min(1, "Phải chọn ít nhất 1 vai trò"),
    companyName: z.string().optional(),
    location: z.string().optional(),
    provinceId: z.number().optional(),
    districtId: z.number().optional(),
    inviteToken: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const updateProfileSchema = z
  .object({
    username: z.string().min(1, "Tên không được để trống"),
    email: z.string().min(1, "Email không được để trống").email(),
    phone: z
      .string()
      .transform((val) => val.replace(/[\s.-]/g, ""))
      .transform((val) => {
        if (!val) return "";
        if (val.startsWith("0")) return "+84" + val.slice(1);
        return val;
      })
      .refine((val) => val === "" || /^\+84\d{9}$/.test(val), {
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
