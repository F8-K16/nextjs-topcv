"use client";

import { Category } from "@/app/types/category.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryService } from "@/services/category.service";
import { applyFieldErrorsToForm, resolveSubmitError } from "@/lib/submit-error";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function EditCategoryModal({
  onClose,
  category,
}: {
  onClose: () => void;
  category: Category;
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
  } = useForm<FormData>({
    defaultValues: {
      name: category.name,
      slug: category.slug,
      parentCategoryId: category.parentCategoryId ?? 0,
    },
  });

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
      await categoryService.updateCategory(category.id, {
        name: data.name,
        slug: data.slug,
        parentCategoryId: data.parentCategoryId,
      });

      toast.success("Cập nhật thành công");
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
            Cập nhật danh mục
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={adminLabel}>Tên danh mục</label>
            <input {...register("name", { required: true })} className={adminInput} />
          </div>

          <div>
            <label className={adminLabel}>Đường dẫn danh mục</label>
            <input {...register("slug", { required: true })} className={adminInput} />
          </div>

          <div>
            <label className={adminLabel}>Danh mục việc làm</label>
            <select
              {...register("parentCategoryId", {
                setValueAs: (v) => Number(v),
              })}
              className={ADMIN_MODAL_SELECT}
              defaultValue={category.parentCategoryId ?? ""}
            >
              <option value="">-- Chọn --</option>
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
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
