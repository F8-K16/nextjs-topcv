import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(1, "Tên không được để trống"),

  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),

  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),

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

  roles: z.array(z.number()).min(1, "Phải chọn ít nhất 1 vai trò"),
});

export const updateUserSchema = z.object({
  username: z.string().min(1, "Tên không được để trống"),
  email: z.string().min(1, "Email không được để trống").email(),
  password: z
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .optional()
    .or(z.literal("")),

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

  roles: z.array(z.number()).min(1),
});
