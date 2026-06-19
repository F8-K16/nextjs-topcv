"use client";

import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categoryService } from "@/services/category.service";
import { applyFieldErrorsToForm, resolveSubmitError } from "@/lib/submit-error";
import { adminCategoriesService } from "@/services/admin-categories.service";
import { cn } from "@/lib/utils";
import {
  ADMIN_MODAL_SELECT,
  adminDialogSurface,
  adminInput,
  adminLabel,
} from "@/lib/admin-ui";

type FormData = {
  name: string;
  slug: string;
  parentCategoryId: number;
};

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export default function CreateCategoryModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [parentCategories, setParentCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>();

  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (name) {
      setValue("slug", slugify(name));
    }
  }, [name, setValue]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("all", "true");
    adminCategoriesService
      .listParentCategories(params)
      .then((res) => setParentCategories(res.categories ?? []))
      .catch(() => setParentCategories([]));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await categoryService.createCategory({
        name: data.name,
        slug: data.slug,
        parentCategoryId: data.parentCategoryId,
      });

      toast.success("Tạo thành công");
      onClose();
      router.refresh();
    } catch (err) {
      const { toastMessage, fieldErrors } = resolveSubmitError(err);
      applyFieldErrorsToForm(setError, fieldErrors);
      toast.error(toastMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn("max-w-md sm:max-w-md", adminDialogSurface, "border")}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white">
            Tạo danh mục
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div>
            <label className={adminLabel}>Tên danh mục</label>
            <input
              placeholder="Nhập tên danh mục (vd: Công nghệ thông tin,...)"
              {...register("name", { required: true })}
              className={adminInput}
            />
          </div>

          <div>
            <label className={adminLabel}>Đường dẫn danh mục</label>
            <input
              placeholder="Nhập slug..."
              {...register("slug", { required: true })}
              className={adminInput}
            />
          </div>

          <div>
            <label className={adminLabel}>Danh mục việc làm</label>
            <select
              {...register("parentCategoryId", {
                setValueAs: (v) => Number(v),
                required: true,
              })}
              className={ADMIN_MODAL_SELECT}
              defaultValue=""
            >
              <option value="">-- Chọn danh mục việc làm --</option>
              {parentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo mới"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
