import type { JobsResponse } from "@/app/types/job.type";
import type { Metadata } from "next";
import type { PendingEmployer, UsersResponse } from "@/app/types/user.type";
import { fetchWrapper } from "@/utils/fetch";
import PendingEmployersTable from "../users/PendingEmployerTable";
import { ModerationStatCards } from "./ModerationStatCards";
import PendingJobsTable from "./PendingJobsTable";
import PendingUsersTable from "./PendingUsersTable";
import { API_BASE_URL } from "@/lib/api-base-url";
import { adminLead, adminPageTitle } from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kiểm duyệt",
  description: "Duyệt công ty, tin đăng và tài khoản chờ xử lý.",
};

export default async function ModerationPage() {
  const [pendingEmployersRes, pendingJobsRes, pendingUsersRes] =
    await Promise.all([
      fetchWrapper(
        `${API_BASE_URL}/admin/employers/pending`,
      ),
      fetchWrapper(
        `${API_BASE_URL}/admin/jobs?page=1&limit=50&moderationStatus=PENDING`,
      ),
      fetchWrapper(
        `${API_BASE_URL}/admin/users?page=1&limit=20&isVerified=false`,
      ),
    ]);

  const pendingEmployersJson = (await pendingEmployersRes.json()) as {
    employers: PendingEmployer[];
  };
  const pendingJobsJson = (await pendingJobsRes.json()) as JobsResponse;
  const pendingUsersJson = (await pendingUsersRes.json()) as UsersResponse;

  const jobs = pendingJobsJson.jobs ?? [];
  const employers = pendingEmployersJson.employers ?? [];
  const users = pendingUsersJson.users ?? [];

  const jobsTotal = pendingJobsJson.pagination?.total ?? jobs.length;
  const usersTotal = pendingUsersJson.pagination?.total ?? users.length;
  const employersTotal = employers.length;

  const jobsOnPage = jobs.length;
  const usersOnPage = users.length;

  const jobsSubtitle =
    jobsOnPage < jobsTotal
      ? `Đang hiển thị ${jobsOnPage} / ${jobsTotal} tin`
      : jobsTotal > 0
        ? `${jobsOnPage} tin trong danh sách`
        : "Không có tin chờ";

  const employersSubtitle =
    employersTotal > 0 ? "Cần duyệt hồ sơ & công ty" : "Không có hồ sơ chờ";

  const usersSubtitle =
    usersOnPage < usersTotal
      ? `Đang hiển thị ${usersOnPage} / ${usersTotal} tài khoản`
      : usersTotal > 0
        ? `${usersOnPage} tài khoản trong danh sách`
        : "Tất cả đã xác thực";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className={adminPageTitle}>Kiểm duyệt hệ thống</h1>
        <p className={cn("max-w-2xl leading-relaxed", adminLead)}>
          Duyệt tin tuyển dụng, kích hoạt tài khoản nhà tuyển dụng và theo dõi
          tài khoản chưa xác thực email.
        </p>
      </div>

      <ModerationStatCards
        jobsTotal={jobsTotal}
        jobsSubtitle={jobsSubtitle}
        employersTotal={employersTotal}
        employersSubtitle={employersSubtitle}
        usersTotal={usersTotal}
        usersSubtitle={usersSubtitle}
      />

      <div className="space-y-6">
        <PendingJobsTable jobs={jobs} />
        <PendingEmployersTable data={employers} />
        <PendingUsersTable users={users} />
      </div>
    </div>
  );
}
