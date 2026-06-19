import Link from "next/link";
import type { User } from "@/app/types/user.type";
import {
  adminModerationBtnGhost,
  adminModerationCountChip,
  adminModerationHeading,
  adminModerationListItem,
  adminModerationPanel,
} from "@/lib/admin-ui";
import { cn } from "@/lib/utils";

export default function PendingUsersTable({ users }: { users: User[] }) {
  return (
    <div id="moderation-users" className={adminModerationPanel}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className={adminModerationHeading}>
          Người dùng chưa xác thực email
          <span className={adminModerationCountChip}>{users.length}</span>
        </h3>
        <Link
          href="/admin/users?isVerified=false"
          className={cn(adminModerationBtnGhost, "px-3 py-1.5 font-semibold")}
        >
          Xem tất cả
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Không có người dùng cần xử lý
        </div>
      ) : (
        <ul className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
          {users.map((u) => (
            <li
              key={u.id}
              className={cn(
                adminModerationListItem,
                "flex flex-wrap items-center justify-between gap-3",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900 dark:text-white">
                  {u.username}
                </p>
                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                  {u.email}
                </p>
                {u.userRoles?.length ? (
                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-500">
                    Vai trò:{" "}
                    {u.userRoles.map((ur) => ur.role.name).join(", ")}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/users/${u.id}`}
                  className={adminModerationBtnGhost}
                >
                  Xem chi tiết
                </Link>
                <Link
                  href={`/admin/users?isVerified=false&search=${encodeURIComponent(u.email)}`}
                  className={adminModerationBtnGhost}
                >
                  Lọc trong Users
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

