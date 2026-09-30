"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Save, Trash2 } from "lucide-react";

import {
  adminSettingsService,
  type SiteSettings,
} from "@/services/admin-settings.service";
import { adminCacheService } from "@/services/admin-cache.service";
import { STALE_ADMIN_SITE_SETTINGS_MS } from "@/lib/query-stale-time";
import { getErrorToastMessage } from "@/lib/submit-error";
import { cn } from "@/lib/utils";
import {
  adminBorderSubtle,
  adminInput,
  adminSurfaceCardBlur,
} from "@/lib/admin-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const schema = z.object({
  siteName: z.string().min(1).max(200),
  logoUrl: z.string().max(500),
  bannerUrl: z.string().max(500),
  seoTitle: z.string().max(200),
  seoDescription: z.string().max(2000),
  maintenanceMode: z.boolean(),
  smtpHost: z.string().max(200),
  smtpPort: z.string(),
  smtpUser: z.string().max(200),
  smtpPass: z.string().max(200),
  smtpFrom: z.string().max(200),
});

type FormValues = z.infer<typeof schema>;

function toForm(s: SiteSettings): FormValues {
  return {
    siteName: s.siteName ?? "",
    logoUrl: s.logoUrl ?? "",
    bannerUrl: s.bannerUrl ?? "",
    seoTitle: s.seoTitle ?? "",
    seoDescription: s.seoDescription ?? "",
    maintenanceMode: Boolean(s.maintenanceMode),
    smtpHost: s.smtpHost ?? "",
    smtpPort: s.smtpPort != null ? String(s.smtpPort) : "",
    smtpUser: s.smtpUser ?? "",
    smtpPass: s.smtpPass ?? "",
    smtpFrom: s.smtpFrom ?? "",
  };
}

const defaultFormValues: FormValues = {
  siteName: "",
  logoUrl: "",
  bannerUrl: "",
  seoTitle: "",
  seoDescription: "",
  maintenanceMode: false,
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
};

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export default function AdminSettingsPageClient() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminSettingsService.get(),
    staleTime: STALE_ADMIN_SITE_SETTINGS_MS,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues,
    values: data ? toForm(data) : defaultFormValues,
  });

  const saveMut = useMutation({
    mutationFn: (payload: FormValues) => {
      const portRaw = payload.smtpPort.trim();
      const smtpPort = portRaw === "" ? null : Number.parseInt(portRaw, 10);
      if (
        smtpPort != null &&
        (Number.isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535)
      ) {
        throw new Error("Port SMTP không hợp lệ");
      }
      return adminSettingsService.update({
        siteName: payload.siteName.trim(),
        logoUrl: emptyToNull(payload.logoUrl),
        bannerUrl: emptyToNull(payload.bannerUrl),
        seoTitle: emptyToNull(payload.seoTitle),
        seoDescription: emptyToNull(payload.seoDescription),
        maintenanceMode: payload.maintenanceMode,
        smtpHost: emptyToNull(payload.smtpHost),
        smtpPort,
        smtpUser: emptyToNull(payload.smtpUser),
        smtpPass: emptyToNull(payload.smtpPass),
        smtpFrom: emptyToNull(payload.smtpFrom),
      });
    },
    onSuccess: () => {
      toast.success("Đã lưu cài đặt");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không lưu được cài đặt"),
  });

  const clearCacheMut = useMutation({
    mutationFn: () => adminCacheService.clearApplicationCache(),
    onSuccess: (r) => {
      toast.success(
        r.keysDeleted === 0
          ? "Không có key cache ứng dụng nào cần xóa."
          : `Đã xóa ${r.keysDeleted} key cache (jp:cache:…).`,
      );
    },
    onError: (e: unknown) =>
      toast.error(getErrorToastMessage(e) || "Không xóa được cache Redis"),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10" />
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-6 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
        <p>Không tải được cài đặt.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 text-sm text-amber-800 underline dark:text-amber-200"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt hệ thống"
        description="Tên site, media, SEO, SMTP và chế độ bảo trì."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
        className={cn("max-w-3xl space-y-3 p-6", adminSurfaceCardBlur)}
      >
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Cache Redis (ứng dụng)
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-500">
            Xóa các key tiền tố{" "}
            <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-[11px] text-zinc-800 dark:bg-white/10 dark:text-zinc-200">
              jp:cache:
            </code>{" "}
            (danh sách việc, metadata, dashboard tóm tắt, v.v.).
          </p>
        </div>
        <button
          type="button"
          disabled={clearCacheMut.isPending}
          onClick={() => clearCacheMut.mutate()}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-900 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60"
        >
          {clearCacheMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {clearCacheMut.isPending ? "Đang xóa…" : "Xóa cache"}
        </button>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
        className={cn("max-w-3xl space-y-5 p-6", adminSurfaceCardBlur)}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
            Tên website
          </label>
          <input
            {...form.register("siteName")}
            className={cn("mt-1", adminInput)}
          />
          {form.formState.errors.siteName && (
            <p className="mt-1 text-xs text-rose-400">
              {form.formState.errors.siteName.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
              Logo URL
            </label>
            <input
              {...form.register("logoUrl")}
              className={cn("mt-1", adminInput)}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
              Banner URL
            </label>
            <input
              {...form.register("bannerUrl")}
              className={cn("mt-1", adminInput)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
            SEO title
          </label>
          <input
            {...form.register("seoTitle")}
            className={cn("mt-1", adminInput)}
          />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
            SEO mô tả
          </label>
          <textarea
            rows={3}
            {...form.register("seoDescription")}
            className={cn("mt-1 min-h-20", adminInput)}
          />
        </div>

        <Controller
          control={form.control}
          name="maintenanceMode"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-black/20">
              <span className="text-sm text-zinc-800 dark:text-zinc-200">
                Chế độ bảo trì
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-rose-500"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            </label>
          )}
        />

        <div className={cn("border-t pt-4", adminBorderSubtle)}>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
            SMTP (tuỳ chọn)
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-500">
                Host
              </label>
              <input
                {...form.register("smtpHost")}
                className={cn("mt-1", adminInput)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-500">
                Port
              </label>
              <input
                {...form.register("smtpPort")}
                className={cn("mt-1", adminInput)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-500">
                User
              </label>
              <input
                {...form.register("smtpUser")}
                className={cn("mt-1", adminInput)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-500">
                Pass
              </label>
              <input
                type="password"
                autoComplete="new-password"
                {...form.register("smtpPass")}
                className={cn("mt-1", adminInput)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-600 dark:text-zinc-500">
                From
              </label>
              <input
                {...form.register("smtpFrom")}
                className={cn("mt-1", adminInput)}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saveMut.isPending || !form.formState.isDirty}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-900/30 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saveMut.isPending ? "Đang lưu…" : "Lưu cài đặt"}
        </button>
      </motion.form>
    </div>
  );
}
