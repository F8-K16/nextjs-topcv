"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { updateResumeSchema } from "@/app/validations/resume.schema";
import { resumeService } from "@/services/resume.service";
import {
  applyFieldErrorsToForm,
  resolveSubmitError,
} from "@/lib/submit-error";
import { adminDialogSurface, adminInput, adminLabel } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

type FormData = z.input<typeof updateResumeSchema>;

type Candidate = {
  id: number;
  user: {
    username: string;
    email: string;
  };
};

export default function EditResumeModal({
  onClose,
  resume,
  candidates,
}: {
  onClose: () => void;
  resume: {
    id: number;
    title: string;
    fileUrl: string;
    candidate: {
      id: number;
    };
  };
  candidates: Candidate[];
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(updateResumeSchema),
    defaultValues: {
      title: resume.title,
      fileUrl: resume.fileUrl,
      candidateId: resume.candidate.id,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (rawData) => {
    const data = updateResumeSchema.parse(rawData);

    try {
      await resumeService.updateResume(resume.id, data);

      toast.success("Cập nhật CV thành công");
      onClose();
      router.refresh();
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  const inputClass = adminInput;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={cn("min-w-xl border", adminDialogSurface)}>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa CV</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className={adminLabel}>Tiêu đề</label>
            <input
              {...register("title")}
              className={inputClass}
              placeholder="Nhập tiêu đề..."
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className={adminLabel}>File CV (URL)</label>
            <input
              {...register("fileUrl")}
              className={inputClass}
              placeholder="https://..."
            />
            {errors.fileUrl && (
              <p className="text-red-400 text-sm mt-1">
                {errors.fileUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className={adminLabel}>Ứng viên</label>
            <select
              {...register("candidateId", {
                setValueAs: (v) => Number(v),
              })}
              className={inputClass}
            >
              <option value="">-- Chọn ứng viên --</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user.username} ({c.user.email})
                </option>
              ))}
            </select>

            {errors.candidateId && (
              <p className="text-red-400 text-sm mt-1">
                {errors.candidateId.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded ${
              !isDirty
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <Save size={16} />
            {isSubmitting ? "Đang lưu..." : "Cập nhật"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
