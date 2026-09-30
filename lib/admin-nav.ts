export const ADMIN_NAV_ITEMS = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: "House",
    permission: "admin:dashboard:read",
    group: "Chính",
  },
  {
    name: "Thông báo",
    href: "/admin/notifications",
    icon: "Bell",
    group: "Chính",
  },
  {
    name: "Kiểm duyệt",
    href: "/admin/moderation",
    icon: "Gavel",
    permission: "admin:moderation:read",
    group: "Chính",
  },
  {
    name: "Người dùng",
    href: "/admin/users",
    icon: "Users",
    permission: "admin:users:read",
    group: "Dữ liệu",
  },
  {
    name: "Danh mục",
    href: "/admin/categories",
    icon: "ChartBarStacked",
    permission: "admin:categories:read",
    group: "Dữ liệu",
  },
  {
    name: "Công ty",
    href: "/admin/companies",
    icon: "Building2",
    permission: "admin:companies:read",
    group: "Dữ liệu",
  },
  {
    name: "Việc làm",
    href: "/admin/jobs",
    icon: "BriefcaseBusiness",
    permission: "admin:jobs:read",
    group: "Dữ liệu",
  },
  {
    name: "Ứng tuyển",
    href: "/admin/applications",
    icon: "ClipboardList",
    permission: "admin:applications:read",
    group: "Dữ liệu",
  },
  {
    name: "CV ứng viên",
    href: "/admin/resumes",
    icon: "FileUser",
    permission: "admin:resumes:read",
    group: "Dữ liệu",
  },
  {
    name: "Mẫu CV",
    href: "/admin/cv-templates",
    icon: "LayoutTemplate",
    permission: "admin:cv_templates:read",
    group: "Dữ liệu",
  },
  {
    name: "Blog",
    href: "/admin/blog",
    icon: "Newspaper",
    permission: "admin:blog:read",
    group: "Dữ liệu",
  },
  {
    name: "Liên hệ",
    href: "/admin/contact",
    icon: "Mail",
    permission: "admin:contact:read",
    group: "Dữ liệu",
  },
  {
    name: "Kỹ năng",
    href: "/admin/skills",
    icon: "Tags",
    permission: "admin:skills:read",
    group: "Danh mục phụ",
  },
  {
    name: "Địa lý",
    href: "/admin/locations",
    icon: "MapPin",
    permission: "admin:locations:read",
    group: "Danh mục phụ",
  },
  {
    name: "Hoạt động",
    href: "/admin/audit-logs",
    icon: "ScrollText",
    permission: "admin:audit_logs:read",
    group: "Hệ thống",
  },
  {
    name: "Phân quyền",
    href: "/admin/access-control",
    icon: "ShieldCheck",
    permission: "admin:access_control:read",
    group: "Hệ thống",
  },
  {
    name: "Cài đặt",
    href: "/admin/settings",
    icon: "Settings",
    permission: "admin:settings:read",
    group: "Hệ thống",
  },
  {
    name: "Thông tin cá nhân",
    href: "/admin/profile",
    icon: "UserRound",
    group: "Hệ thống",
  },
  {
    name: "Xác thực hai lớp",
    href: "/admin/security",
    icon: "ShieldCheck",
    group: "Hệ thống",
  },
] as const;

export type AdminNavItem = (typeof ADMIN_NAV_ITEMS)[number];

export const ADMIN_NAV_GROUP_ORDER = [
  "Chính",
  "Dữ liệu",
  "Danh mục phụ",
  "Hệ thống",
] as const;

export function getAdminPageTitle(pathname: string) {
  if (pathname === "/admin") return "Tổng quan";

  const match = ADMIN_NAV_ITEMS.filter(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match?.name ?? "Bảng điều khiển";
}
