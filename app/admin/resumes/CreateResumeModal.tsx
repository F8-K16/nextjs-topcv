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
import { Check } from "lucide-react";

import { createResumeSchema } from "@/app/validations/resume.schema";
import { resumeService } from "@/services/resume.service";
import {
  applyFieldErrorsToForm,
  resolveSubmitError,
} from "@/lib/submit-error";

type FormData = z.input<typeof createResumeSchema>;

type Candidate = {
  id: number;
  user: {
    username: string;
    email: string;
  };
};

export default function CreateResumeModal({
  onClose,
  candidates,
}: {
  onClose: () => void;
  candidates: Candidate[];
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      title: "",
      fileUrl: "",
      candidateId: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (rawData) => {
    const data = createResumeSchema.parse(rawData);

    try {
      await resumeService.createResume(data);
      toast.success("Tạo CV thành công");
      onClose();
      router.refresh();
    } catch (error) {
      const { toastMessage, fieldErrors } = resolveSubmitError(error);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#1e1e1e] text-white border border-gray-700 min-w-125">
        <DialogHeader>
          <DialogTitle>Tạo CV mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-gray-400">Tiêu đề</label>
            <input
              placeholder="Nhập tiêu đề CV..."
              {...register("title")}
              className="w-full p-2 bg-[#2f2f2f] rounded"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Đường dẫn file</label>
            <input
              placeholder="https://..."
              {...register("fileUrl")}
              className="w-full p-2 bg-[#2f2f2f] rounded"
            />
            {errors.fileUrl && (
              <p className="text-red-400 text-sm mt-1">
                {errors.fileUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">Ứng viên</label>
            <select
              {...register("candidateId", {
                setValueAs: (v) => (v ? Number(v) : undefined),
              })}
              className="w-full p-2 bg-[#2f2f2f] rounded"
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
            disabled={isSubmitting}
            className="w-full bg-blue-500 py-2 rounded flex justify-center gap-2"
          >
            <Check size={16} />
            {isSubmitting ? "Đang tạo..." : "Tạo mới"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
