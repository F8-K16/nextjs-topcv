import type { Job } from "@/app/types/job.type";
import type { Metadata } from "next";
import { JOB_MODERATION_OPTIONS, JOB_TYPE_OPTIONS } from "@/app/types/job.type";
import { fetchWrapper } from "@/utils/fetch";
import {
  formatDate,
  formatExperience,
  formatSalaryShort,
} from "@/utils/helper";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-base-url";
import { cn } from "@/lib/utils";
import {
  adminBorderSubtle,
  adminPageTitle,
  adminSurfaceCardBlur,
} from "@/lib/admin-ui";

export const metadata: Metadata = {
  title: "Chi tiết tin tuyển dụng",
  description: "Xem và chỉnh thông tin tin đăng (admin).",
};

function modLabel(status: string | undefined) {
  return (
    JOB_MODERATION_OPTIONS.find((m) => m.value === status)?.label ||
    status ||
    "—"
  );
}

function modBadgeClass(status: string | undefined) {
  const v = status || "APPROVED";
  if (v === "APPROVED")
    return "bg-emerald-100 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20";
  if (v === "PENDING")
    return "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/20";
  return "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/20";
}

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/jobs/${id}`,
  );
  if (res.status === 404) notFound();
  const job = (await res.json()) as Job | null;
  if (!job?.id) notFound();

  const jobTypeLabel =
    JOB_TYPE_OPTIONS.find((t) => t.value === job.jobType)?.label || job.jobType;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách việc làm
      </Link>

      <div className={cn(adminSurfaceCardBlur, "p-6 shadow-xl")}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/15">
            <Image
              src={job.company.logo || "/images/logo-default.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={adminPageTitle}>{job.title}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">ID #{job.id}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${modBadgeClass(job.moderationStatus)}`}
              >
                {modLabel(job.moderationStatus)}
              </span>
              {job.isFeatured ? (
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                  Nổi bật
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {job.company?.id != null && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Công ty
            </p>
            <Link
              href={`/admin/companies/${job.company.id}`}
              className="mt-1 inline-block text-base font-medium text-sky-700 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
            >
              {job.company.name}
            </Link>
            <p className="mt-1 text-sm text-zinc-500">
              {[
                job.workLocation ||
                  [job.company.district?.name, job.company.province?.name]
                    .filter(Boolean)
                    .join(", "),
              ]
                .filter(Boolean)
                .join("") || job.company.location}
            </p>
          </div>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Danh mục
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              {job.category?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Loại hình
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{jobTypeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Cấp bậc
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              {formatExperience(job.experienceLevel)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Lương
            </dt>
            <dd className="mt-1 font-medium text-emerald-700 dark:text-emerald-300/90">
              {formatSalaryShort(job.minSalary, job.maxSalary)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Số lượng
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{job.quantity}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Hạn nộp
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              {job.deadline ? formatDate(job.deadline) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Tạo / cập nhật
            </dt>
            <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {formatDate(job.createdAt)} · {formatDate(job.updatedAt)}
            </dd>
          </div>
        </dl>

        {job.jobSkills && job.jobSkills.length > 0 && (
          <div className={cn("mt-6 border-t pt-6", adminBorderSubtle)}>
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Kỹ năng
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {job.jobSkills.map((js) => (
                <li
                  key={js.skill.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300"
                >
                  {js.skill.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={cn("mt-6 border-t pt-6", adminBorderSubtle)}>
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Mô tả công việc
          </h2>
          <div
            className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 [&_a]:text-sky-700 [&_a]:underline dark:[&_a]:text-sky-400 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-semibold [&_h2]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>
      </div>
    </div>
  );
}
