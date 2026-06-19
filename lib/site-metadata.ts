import type { Metadata } from "next";

export const SITE_BRAND = "TopCV";

export const rootMetadata: Metadata = {
  title: {
    default: `Trang chủ | ${SITE_BRAND}`,
    template: `%s | ${SITE_BRAND}`,
  },
  description:
    "Tìm việc làm, ứng tuyển và tuyển dụng uy tín — nền tảng việc làm thông minh tại Việt Nam.",
};

export const adminLayoutMetadata: Metadata = {
  title: {
    default: `Quản trị | ${SITE_BRAND}`,
    template: `%s · Quản trị | ${SITE_BRAND}`,
  },
};

export const employerLayoutMetadata: Metadata = {
  title: {
    default: `Nhà tuyển dụng | ${SITE_BRAND}`,
    template: `%s | Nhà tuyển dụng | ${SITE_BRAND}`,
  },
};

export const authLayoutMetadata: Metadata = {
  title: {
    default: `Tài khoản | ${SITE_BRAND}`,
    template: `%s | ${SITE_BRAND}`,
  },
};
