import type { Company } from "@/app/types/company.type";
import type { Metadata } from "next";
import { JOB_MODERATION_OPTIONS } from "@/app/types/job.type";
import { fetchWrapper } from "@/utils/fetch";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-base-url";
import {
  adminBorderSubtle,
  adminPageTitle,
  adminSectionTitle,
  adminSurfaceCardBlur,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chi tiết công ty",
  description: "Thông tin doanh nghiệp, nhân sự HR và tin đăng liên quan.",
};

type CompanyJobRow = {
  id: number;
  title: string;
  moderationStatus?: string;
  deadline?: string | null;
  createdAt?: string;
  isFeatured?: boolean;
  _count?: { applications: number };
};

type CompanyDetail = Omit<Company, "employers"> & {
  description?: string | null;
  employers?: {
    status?: string;
    user?: { id: number; username: string; email: string };
  }[];
  jobs?: CompanyJobRow[];
  _count?: { jobs: number; employers: number };
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
    return "bg-emerald-500/15 text-emerald-800 ring-emerald-500/30 dark:text-emerald-300 dark:ring-emerald-500/20";
  if (v === "PENDING")
    return "bg-amber-500/15 text-amber-900 ring-amber-500/30 dark:text-amber-200 dark:ring-amber-500/20";
  return "bg-rose-500/15 text-rose-800 ring-rose-500/30 dark:text-rose-200 dark:ring-rose-500/20";
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/companies/${id}`,
  );
  if (res.status === 404) notFound();
  const company = (await res.json()) as CompanyDetail | null;
  if (!company?.id) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách công ty
      </Link>

      <div className={cn("p-6 shadow-xl", adminSurfaceCardBlur)}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10">
            <Image
              src={company.logo || "/images/logo-default.png"}
              alt={company.name}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className={adminPageTitle}>{company.name}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              ID #{company.id}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  company.status
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                    : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {company.status ? "Đang hoạt động" : "Ngừng hoạt động"}
              </span>
              {company._count?.jobs != null && (
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {company._count.jobs} tin tuyển dụng
                </span>
              )}
            </div>
          </div>
        </div>

        {company.description ? (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {company.description}
          </p>
        ) : null}

        <dl
          className={cn(
            "mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2",
            adminBorderSubtle,
          )}
        >
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Website
            </dt>
            <dd className="mt-1">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  {company.website}
                </a>
              ) : (
                <span className="text-zinc-500">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Địa điểm
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              <span className="block line-clamp-2 break-words">
                {company.location}
              </span>
              {(company.district?.name || company.province?.name) && (
                <span className="mt-1 block text-sm text-zinc-500">
                  {[company.district?.name, company.province?.name]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </dd>
          </div>
          {company.categories?.length ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Danh mục
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {company.categories.map((c) => (
                  <span
                    key={c.category.id}
                    className="rounded-md bg-purple-500/15 px-2 py-0.5 text-xs text-purple-800 dark:text-purple-300"
                  >
                    {c.category.name}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      {company.employers && company.employers.length > 0 && (
        <div className={cn("p-6 shadow-xl", adminSurfaceCardBlur)}>
          <h2 className={adminSectionTitle}>Tài khoản nhà tuyển dụng</h2>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-white/5">
            {company.employers.map((e, i) => (
              <li
                key={e.user?.id ?? i}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  {e.user ? (
                    <Link
                      href={`/admin/users/${e.user.id}`}
                      className="font-medium text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                    >
                      {e.user.username}
                    </Link>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                  {e.user?.email ? (
                    <span className="ml-2 text-zinc-500">{e.user.email}</span>
                  ) : null}
                </div>
                {e.status ? (
                  <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {e.status}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {company.jobs && company.jobs.length > 0 && (
        <div className={cn("p-6 shadow-xl", adminSurfaceCardBlur)}>
          <h2 className={adminSectionTitle}>
            Tin tuyển dụng (hiển thị tối đa 80 mới nhất)
          </h2>
          <ul className="mt-3 space-y-2">
            {company.jobs.map((j) => (
              <li
                key={j.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-zinc-900/40"
              >
                <Link
                  href={`/admin/jobs/${j.id}`}
                  className="font-medium text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  {j.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  {j.isFeatured ? (
                    <span className="text-[10px] font-semibold text-violet-800 dark:text-violet-300">
                      Nổi bật
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${modBadgeClass(j.moderationStatus)}`}
                  >
                    {modLabel(j.moderationStatus)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {j._count?.applications ?? 0} ứng tuyển
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
