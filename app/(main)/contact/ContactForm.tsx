"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { contactService } from "@/services/contact.service";
import { getErrorToastMessage } from "@/lib/submit-error";

const schema = z.object({
  name: z.string().trim().min(2, "Nhập họ tên").max(120),
  email: z.string().trim().email("Email không hợp lệ"),
  subject: z.string().trim().min(4, "Nhập chủ đề").max(200),
  message: z.string().trim().min(10, "Nội dung tối thiểu 10 ký tự").max(4000),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await contactService.send(values);
      setSent(true);
      reset();
      toast.success("Đã gửi liên hệ. Kiểm tra email xác nhận.");
    } catch (e) {
      toast.error(getErrorToastMessage(e) || "Không gửi được. Thử lại sau.");
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        Cảm ơn bạn. Chúng tôi đã gửi email xác nhận và sẽ phản hồi hộp thư bạn đã
        điền.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="hidden" aria-hidden>
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800" htmlFor="contact-name">
          Họ tên
        </label>
        <input
          id="contact-name"
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800" htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800" htmlFor="contact-subject">
          Chủ đề
        </label>
        <input
          id="contact-subject"
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...register("subject")}
        />
        {errors.subject ? (
          <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800" htmlFor="contact-message">
          Nội dung
        </label>
        <textarea
          id="contact-message"
          rows={6}
          className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...register("message")}
        />
        {errors.message ? (
          <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gửi liên hệ"}
      </button>
    </form>
  );
}
