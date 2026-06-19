"use client";

import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Briefcase, Building2, Users } from "lucide-react";

export type ModerationStatCardsProps = {
  jobsSubtitle: string;
  jobsTotal: number;
  employersSubtitle: string;
  employersTotal: number;
  usersSubtitle: string;
  usersTotal: number;
};

export function ModerationStatCards({
  jobsSubtitle,
  jobsTotal,
  employersSubtitle,
  employersTotal,
  usersSubtitle,
  usersTotal,
}: ModerationStatCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <AdminStatCard
        title="Việc làm chờ duyệt"
        value={jobsTotal}
        subtitle={jobsSubtitle}
        icon={Briefcase}
        href="#moderation-jobs"
        accent="from-amber-500/20 via-orange-500/10 to-transparent"
      />
      <AdminStatCard
        title="Nhà tuyển dụng chờ duyệt"
        value={employersTotal}
        subtitle={employersSubtitle}
        icon={Building2}
        href="#moderation-employers"
        accent="from-sky-500/20 via-cyan-500/10 to-transparent"
      />
      <AdminStatCard
        title="Người dùng chưa xác thực"
        value={usersTotal}
        subtitle={usersSubtitle}
        icon={Users}
        href="#moderation-users"
        accent="from-violet-500/20 via-fuchsia-500/10 to-transparent"
      />
    </div>
  );
}
