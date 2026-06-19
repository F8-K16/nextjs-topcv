"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePenLine, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cvService } from "@/services/cv.service";
import {
  GC_DEFAULT_MS,
  STALE_MY_CVS_MS,
} from "@/lib/query-stale-time";
import { useAuthStore } from "@/app/stores/auth.store";
import { requestAppConfirm } from "@/app/stores/confirm-dialog.store";
import { formatDate } from "@/utils/helper";

export default function MyCvsClient() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAuthed = Boolean(user?.id);

  const { data: cvs = [], isLoading, isError } = useQuery({
    queryKey: ["my-cvs", user?.id],
    queryFn: () => cvService.listMyCvs(),
    enabled: isAuthed,
    staleTime: STALE_MY_CVS_MS,
    gcTime: GC_DEFAULT_MS,
  });

  const drafts = cvs.filter((cv) => cv.status === "DRAFT");

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cvService.deleteCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-cvs"] });
      toast.success("Đã xóa CV");
    },
    onError: () => {
      toast.error("Không xóa được CV");
    },
  });

  const handleDelete = async (id: number) => {
    const ok = await requestAppConfirm({
      title: "Xóa CV?",
      description:
        "Bạn chắc chắn muốn xóa CV này? Hành động không thể hoàn tác.",
      confirmLabel: "Xóa",
      variant: "destructive",
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (!isAuthed) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/60">
        <p className="text-sm text-slate-600">
          Vui lòng đăng nhập để xem CV của bạn.
        </p>
        <Link
          href="/auth/login?next=/cv/my"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-[#00b14f] px-4 text-sm font-semibold text-white"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00b14f]/20 bg-white px-3 py-1 text-xs font-medium text-[#00b14f]">
            <FileText className="h-3.5 w-3.5" />
            CV nháp
          </div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            CV nháp của bạn
          </h1>
          <p className="mt-1 hidden text-sm text-gray-500 sm:block">
            Tiếp tục chỉnh sửa bản nháp. CV đã hoàn tất sẽ nằm trong trang Hồ sơ
            ứng tuyển.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href="/cv/templates"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#009944] sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Tạo CV mới
          </Link>
          <Link
            href="/resumes"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            Hồ sơ ứng tuyển
          </Link>
        </div>
      </header>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50 sm:p-5 md:p-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#00b14f]" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-12 text-center text-sm text-red-700">
            Không tải được danh sách CV.
          </div>
        ) : drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/80 py-16 text-center text-slate-600">
            <FileText
              className="mx-auto h-10 w-10 text-[#00b14f]/70"
              strokeWidth={1.5}
            />
            <p className="mt-3 text-sm">
              Bạn chưa có bản nháp nào. Hãy chọn một mẫu để bắt đầu.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/cv/templates"
                className="inline-flex h-10 items-center rounded-lg bg-[#00b14f] px-4 text-sm font-semibold text-white"
              >
                Khám phá mẫu CV
              </Link>
              <Link
                href="/resumes"
                className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Xem hồ sơ ứng tuyển
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {drafts.map((cv) => {
              return (
                <li
                  key={cv.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f6ec]">
                    <FileText className="h-5 w-5 text-[#00b14f]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/cv/editor/${cv.id}`}
                        className="font-semibold text-slate-900 hover:text-[#00b14f]"
                      >
                        {cv.title}
                      </Link>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                        Bản nháp
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Mẫu: {cv.template.name} · Chỉnh sửa{" "}
                      {formatDate(cv.lastEditedAt)}
                    </p>
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Link
                      href={`/cv/editor/${cv.id}`}
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#00b14f] px-3 text-xs font-semibold text-white hover:bg-[#009944] sm:w-auto"
                    >
                      <FilePenLine className="h-3.5 w-3.5" />
                      Tiếp tục sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(cv.id)}
                      className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50 sm:w-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xóa
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
