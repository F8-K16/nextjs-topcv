"use client";

import { formatPhone, roleMap } from "@/utils/helper";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  ShieldBan,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useModal } from "../components/ModalManager";
import { UsersResponse } from "@/app/types/user.type";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { cn } from "@/lib/utils";
import {
  ADMIN_ADD_NEW_BUTTON,
  ADMIN_NATIVE_SELECT,
  adminDropdownItem,
  adminDropdownPanel,
  adminKebabButton,
  adminSearchFieldWithIcon,
  adminSurfaceCardBlur,
  adminTableDivide,
  adminTableHeadRow,
} from "@/lib/admin-ui";
import AdminPagination from "@/components/admin/AdminPagination";
import { getErrorToastMessage } from "@/lib/submit-error";
import UserAvatar from "@/app/(main)/components/UserAvatar";

export default function UsersTable({ data }: { data: UsersResponse }) {
  const { users, pagination, roles } = data;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  const [menuUserId, setMenuUserId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "delete";
    userId: number;
    label: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", role);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleVerifiedChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("isVerified", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const handleBlockedFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("isBlocked", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    router.refresh();
  };

  const toggleBlock = async (u: (typeof users)[0]) => {
    const phone = u.userPhone?.phone;
    if (!phone) {
      toast.error("User chưa có SĐT — mở form sửa để cập nhật.");
      return;
    }
    try {
      await userService.updateUser(u.id, {
        email: u.email,
        username: u.username,
        phone,
        roles: u.userRoles.map((r) => r.role.id),
        isVerified: u.isVerified,
        isBlocked: !u.isBlocked,
      });
      toast.success(u.isBlocked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      setMenuUserId(null);
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Thao tác thất bại");
    }
  };

  const runDelete = async () => {
    if (!confirm || confirm.type !== "delete") return;
    setConfirmLoading(true);
    try {
      await userService.deleteUser(confirm.userId);
      toast.success("Xóa thành công");
      setConfirm(null);
      router.refresh();
    } catch (error) {
      toast.error(getErrorToastMessage(error) || "Xóa thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div>
      <AdminConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Xóa người dùng?"
        description={
          confirm ? `Hành động không hoàn tác cho: ${confirm.label}` : ""
        }
        confirmLabel="Xóa"
        variant="destructive"
        loading={confirmLoading}
        onConfirm={runDelete}
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Danh sách người dùng
        </h1>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-50 flex-1 lg:max-w-xs">
            <input
              type="text"
              placeholder="Tên, Email, SĐT..."
              onChange={handleSearch}
              defaultValue={searchParams.get("search") || ""}
              className={adminSearchFieldWithIcon}
            />
            <Search
              className="pointer-events-none absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500"
              size={18}
            />
          </div>

          <select
            onChange={(e) => handleRoleChange(e.target.value)}
            defaultValue={searchParams.get("role") || ""}
            className={ADMIN_NATIVE_SELECT}
          >
            <option value="">— Vai trò —</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {roleMap[role.name] || role.name}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => handleVerifiedChange(e.target.value)}
            defaultValue={searchParams.get("isVerified") || ""}
            className={ADMIN_NATIVE_SELECT}
          >
            <option value="">— Email xác thực —</option>
            <option value="true">Đã xác thực</option>
            <option value="false">Chưa xác thực</option>
          </select>

          <select
            onChange={(e) => handleBlockedFilter(e.target.value)}
            defaultValue={searchParams.get("isBlocked") || ""}
            className={ADMIN_NATIVE_SELECT}
          >
            <option value="">— Trạng thái khóa —</option>
            <option value="false">Đang mở</option>
            <option value="true">Đang khóa</option>
          </select>

          <button
            type="button"
            onClick={() => openModal("create-user", { roles })}
            className={ADMIN_ADD_NEW_BUTTON}
          >
            <Plus size={18} />
            Thêm mới
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(adminSurfaceCardBlur, "overflow-hidden p-0")}
      >
        <div className="overflow-x-auto">
          <table className={cn("min-w-full text-sm", adminTableDivide)}>
            <thead>
              <tr
                className={cn(
                  adminTableHeadRow,
                  "uppercase tracking-wide",
                )}
              >
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className={adminTableDivide}>
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    Không có bản ghi phù hợp bộ lọc.
                  </td>
                </tr>
              )}
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-600 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300">
                        <UserAvatar
                          avatar={user?.avatar}
                          username={user?.username}
                          size={48}
                        />
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {formatPhone(user.userPhone?.phone)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {user.userRoles
                      .map((r) => roleMap[r.role.name] || r.role.name)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.isVerified
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
                        }`}
                      >
                        {user.isVerified ? "Email OK" : "Email chờ"}
                      </span>
                      {user.isBlocked ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                          Khóa
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300">
                          Mở
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-flex justify-end">
                      <button
                        type="button"
                        aria-label="Thao tác"
                        onClick={() =>
                          setMenuUserId((v) => (v === user.id ? null : user.id))
                        }
                        className={adminKebabButton}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {menuUserId === user.id && (
                        <>
                          <button
                            type="button"
                            aria-label="Đóng menu"
                            className="fixed inset-0 z-10 cursor-default bg-transparent"
                            onClick={() => setMenuUserId(null)}
                          />
                          <div className={cn(adminDropdownPanel, "w-48")}>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className={adminDropdownItem}
                              onClick={() => setMenuUserId(null)}
                            >
                              <Eye size={16} />
                              Chi tiết
                            </Link>
                            <button
                              type="button"
                              className={adminDropdownItem}
                              onClick={() => {
                                setMenuUserId(null);
                                openModal("edit-user", { user, roles });
                              }}
                            >
                              <Edit size={16} />
                              Sửa
                            </button>
                            <button
                              type="button"
                              className={adminDropdownItem}
                              onClick={() => {
                                setMenuUserId(null);
                                void toggleBlock(user);
                              }}
                            >
                              {user.isBlocked ? (
                                <>
                                  <ShieldCheck size={16} />
                                  Mở khóa
                                </>
                              ) : (
                                <>
                                  <ShieldBan size={16} />
                                  Khóa TK
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                              onClick={() => {
                                setMenuUserId(null);
                                setConfirm({
                                  type: "delete",
                                  userId: user.id,
                                  label: user.username,
                                });
                              }}
                            >
                              <Trash2 size={16} />
                              Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </motion.div>
    </div>
  );
}
