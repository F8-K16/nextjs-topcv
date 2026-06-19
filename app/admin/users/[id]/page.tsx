import { fetchWrapper } from "@/utils/fetch";
import type { Metadata } from "next";
import { formatDate, formatPhone, roleMap } from "@/utils/helper";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-base-url";
import { cn } from "@/lib/utils";
import { adminSurfaceCardBlur } from "@/lib/admin-ui";

export const metadata: Metadata = {
  title: "Chi tiết người dùng",
  description: "Hồ sơ, vai trò và hoạt động của một tài khoản.",
};

type ResumeRow = { id: number; title?: string | null };
type ApplicationRow = {
  id?: number;
  job?: {
    title?: string;
    employer?: { company?: { name?: string } };
  };
};

type CandidateProfile = {
  province?: { name?: string };
  district?: { name?: string };
  resumes?: ResumeRow[];
  applications?: ApplicationRow[];
};

type EmployerJob = {
  id: number;
  title?: string;
  applications?: { id: number }[];
};

type EmployerProfile = {
  company?: {
    id?: number;
    name?: string;
    categories?: { category: { id: number; name: string } }[];
  };
  jobs?: EmployerJob[];
};

type UserDetail = {
  id: number;
  email: string;
  username: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  userPhone?: { phone: string } | null;
  userRoles: { role: { name: string } }[];
  allPermissions?: string[];
  candidate?: CandidateProfile | null;
  employer?: EmployerProfile | null;
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetchWrapper(
    `${API_BASE_URL}/admin/users/${id}`,
  );
  if (res.status === 404) notFound();
  const user = (await res.json()) as UserDetail | null;
  if (!user?.id) notFound();

  const rolesLabel = user.userRoles
    .map((r) => roleMap[r.role.name] || r.role.name)
    .join(", ");

  const perms = user.allPermissions ?? [];
  const cand = user.candidate;
  const emp = user.employer;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Danh sách người dùng
      </Link>

      <div className={cn(adminSurfaceCardBlur, "p-6 shadow-xl")}>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {user.username}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">ID #{user.id}</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Email
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Số điện thoại
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              {formatPhone(user.userPhone?.phone)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Vai trò
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              {rolesLabel || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Ngày tạo
            </dt>
            <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
              {formatDate(user.createdAt)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Trạng thái
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.isVerified
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
                }`}
              >
                {user.isVerified ? "Email đã xác thực" : "Email chưa xác thực"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.isBlocked
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300"
                }`}
              >
                {user.isBlocked ? "Tài khoản khóa" : "Tài khoản hoạt động"}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {perms.length > 0 && (
        <div className={cn(adminSurfaceCardBlur, "p-6 shadow-xl")}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Quyền hiệu lực
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {perms.map((p) => (
              <li
                key={p}
                className="rounded-lg border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cand && (
        <div className={cn(adminSurfaceCardBlur, "p-6 shadow-xl")}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Hồ sơ ứng viên
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {[cand.district?.name, cand.province?.name].filter(Boolean).join(", ") ||
              "—"}
          </p>
          {cand.resumes && cand.resumes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                CV / Hồ sơ ({cand.resumes.length})
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {cand.resumes.map((r) => (
                  <li key={r.id}>
                    {r.title || `Hồ sơ #${r.id}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cand.applications && cand.applications.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Ứng tuyển ({cand.applications.length})
              </h3>
              <ul className="mt-2 divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-white/5 dark:border-white/10">
                {cand.applications.map((a, i) => (
                  <li
                    key={a.id ?? i}
                    className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="text-zinc-900 dark:text-white">
                      {a.job?.title ?? "—"}
                    </span>
                    {a.job?.employer?.company?.name ? (
                      <span className="ml-2 text-zinc-500">
                        · {a.job.employer.company.name}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {emp?.company && (
        <div className={cn(adminSurfaceCardBlur, "p-6 shadow-xl")}>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Nhà tuyển dụng
          </h2>
          <p className="mt-2 text-zinc-900 dark:text-white">{emp.company.name}</p>
          {emp.company.categories && emp.company.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {emp.company.categories.map((c) => (
                <span
                  key={c.category.id}
                  className="rounded-md bg-violet-100 px-2 py-0.5 text-xs text-violet-800 dark:bg-purple-500/15 dark:text-purple-300"
                >
                  {c.category.name}
                </span>
              ))}
            </div>
          )}
          {emp.company.id != null && (
            <Link
              href={`/admin/companies/${emp.company.id}`}
              className="mt-3 inline-block text-sm text-sky-400 hover:text-sky-300"
            >
              Xem chi tiết công ty →
            </Link>
          )}
          {emp.jobs && emp.jobs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tin đã đăng ({emp.jobs.length})
              </h3>
              <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto text-sm text-zinc-300">
                {emp.jobs.map((j) => (
                  <li key={j.id}>
                    <Link
                      href={`/admin/jobs/${j.id}`}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      {j.title ?? `#${j.id}`}
                    </Link>
                    <span className="ml-2 text-xs text-zinc-500">
                      {j.applications?.length ?? 0} ứng viên
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
