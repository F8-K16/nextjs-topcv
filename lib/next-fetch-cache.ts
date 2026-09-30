/**
 * Preset `next: { revalidate, tags }` dùng cho server-side fetch trong Next.js App Router.
 *
 * TTL-based ISR là cơ chế chính — không có `revalidateTag()` được gọi từ backend,
 * nên tags chỉ là marker để dễ trace, không kích hoạt on-demand invalidation.
 *
 * Thứ tự cache:
 *   Browser → Next.js Data Cache (revalidate = TTL) → Redis (nodejs-topcv) → DB
 */
export const nextFetchCache = {
  /** Không cache gì (auth, personalized) */
  dynamic: { cache: "no-store" as const },

  /**
   * Danh sách job công khai — ISR 4 phút.
   * Redis backend giữ 4 phút nữa, tổng tối đa ~8 phút.
   */
  jobList: { next: { revalidate: 240, tags: ["api-jobs-public"] as string[] } },

  /** Chi tiết job — ISR 2 phút */
  jobDetail: {
    next: { revalidate: 120, tags: ["api-job-detail"] as string[] },
  },

  /** Danh sách công ty — ISR 3 phút */
  companyList: {
    next: { revalidate: 180, tags: ["api-companies-public"] as string[] },
  },

  /** Chi tiết công ty — ISR 2 phút */
  companyDetail: {
    next: { revalidate: 120, tags: ["api-company-detail"] as string[] },
  },

  /** Top hiring (trang chủ) — ISR 4 phút */
  topHiring: {
    next: { revalidate: 240, tags: ["api-top-hiring"] as string[] },
  },

  /**
   * Blog server pages — ISR 1 giờ.
   * Redis backend cache 24h, invalidate ngay khi admin publish/sửa/xóa.
   * Next.js Data Cache sẽ refetch sau tối đa 1h nên bài mới hiện trong ~1h.
   */
  blog: {
    next: { revalidate: 3600, tags: ["api-blog"] as string[] },
  },

  /** Fallback */
  default: { next: { revalidate: 60 } },
} as const;
