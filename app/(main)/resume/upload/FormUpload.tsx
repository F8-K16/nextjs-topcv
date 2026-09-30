"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { resumeService } from "@/services/resume.service";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  applyFieldErrorsToForm,
  getErrorToastMessage,
  resolveSubmitError,
} from "@/lib/submit-error";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";
import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";

const cvSchema = z.object({
  resumeUrl: z.string().min(1, "Vui lòng upload CV"),
});

type FormData = z.infer<typeof cvSchema>;

const MAX_BYTES = 5 * 1024 * 1024;

export default function FormUploadCV() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hideCandidateFeatures = useAuthenticatedNonCandidate();
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileReady, setFileReady] = useState(false);

  const {
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(cvSchema),
    defaultValues: {
      resumeUrl: "",
    },
  });

  const resumeUrl = watch("resumeUrl");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast.error("Chỉ hỗ trợ file PDF");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("File tối đa 5MB");
        return;
      }
      setUploading(true);
      setFileReady(false);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        toast.error(data?.message || "Tải file lên thất bại");
        return;
      }
      setValue("resumeUrl", data.url);
      setFileName(file.name);
      setFileReady(true);
      toast.success("Đã tải file — nhấn «Lưu vào hồ sơ» để hoàn tất.");
    } catch (e) {
      toast.error(
        getErrorToastMessage(e) || "Đã có lỗi xảy ra. Upload thất bại.",
      );
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      await resumeService.uploadMyResume({
        title: fileName || "CV.pdf",
        fileUrl: formData.resumeUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ["my-resumes"] });
      toast.success("Đã lưu CV vào hồ sơ — bạn có thể ứng tuyển ngay.");
      setFileName("");
      setFileReady(false);
      setValue("resumeUrl", "");
      router.push("/resumes");
    } catch (err) {
      const { toastMessage, fieldErrors } = resolveSubmitError(err);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage || "Lưu CV thất bại");
    }
  };

  if (hideCandidateFeatures) {
    return (
      <CandidateOnlyNotice className="rounded-2xl shadow-sm ring-1 ring-slate-200/50">
        Tải lên CV chỉ dành cho tài khoản ứng viên. Với nhà tuyển dụng, hãy dùng
        khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-b-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50 sm:space-y-6 sm:rounded-b-2xl sm:p-6 md:p-8"
      >
        <p className="mb-0 text-sm leading-relaxed text-gray-600">
          Bạn đã có sẵn CV của mình, chỉ cần tải CV lên, hệ thống sẽ tự động đề
          xuất CV của bạn tới nhà tuyển dụng uy tín.
        </p>

        <p className="hidden text-sm text-gray-600 sm:block">
          Tiết kiệm thời gian, tìm việc thông minh, nắm bắt cơ hội và làm chủ
          đường đua nghề nghiệp của chính mình.
        </p>

        <div className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/50 p-6 text-center sm:rounded-2xl sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
            {fileReady ? (
              <CheckCircle2 className="text-[#00b14f]" size={28} />
            ) : (
              <Upload className="text-gray-500" size={24} />
            )}
          </div>

          <p className="font-medium text-gray-800">
            Tải lên CV từ máy tính, chọn hoặc kéo thả
          </p>

          <p className="text-sm text-gray-400 mt-1 mb-5">
            Hỗ trợ định dạng PDF, tối đa 5MB
          </p>

          <label className="inline-flex cursor-pointer items-center justify-center px-5 h-10 rounded-lg bg-[#00b14f]/10 text-sm font-semibold text-[#00b14f] hover:bg-[#00b14f]/15">
            {uploading ? "Đang tải lên..." : "Chọn CV"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>

          {fileName && (
            <p className="mt-4 text-sm font-medium text-[#00b14f]">
              {fileName}
            </p>
          )}

          {errors.resumeUrl && (
            <p className="mt-3 text-sm text-red-500">
              {errors.resumeUrl.message}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <button
            type="submit"
            disabled={isSubmitting || uploading || !resumeUrl}
            className="h-11 w-full rounded-xl bg-[#00b14f] px-8 text-sm font-semibold text-white transition hover:bg-[#009944] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu vào hồ sơ"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/resumes")}
            className="h-11 w-full rounded-xl border border-gray-200 px-6 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:w-auto"
          >
            Xem CV đã có
          </button>
        </div>

        {resumeUrl && (
          <div className="overflow-hidden rounded-2xl bg-slate-100/90 p-2 ring-1 ring-slate-200/70 shadow-inner sm:p-3">
            <p className="mb-2 px-1 text-sm font-medium text-slate-700">
              Xem trước trước khi lưu
            </p>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/40">
              <iframe
                title="Xem trước CV"
                src={resumeUrl}
                className="h-[min(780px,78vh)] w-full border-0 bg-white sm:h-[min(960px,85vh)]"
                style={{ colorScheme: "light" }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
