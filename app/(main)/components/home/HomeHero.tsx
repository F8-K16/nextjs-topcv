"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import { useLocationStore } from "@/app/stores/location.store";
import { useMetadataStore } from "@/app/stores/metadata.store";
import { useAuthStore } from "@/app/stores/auth.store";
import { useFixedDropdownPlacement } from "@/hooks/use-fixed-dropdown-placement";
import { useDebounce } from "@/hooks/use-debounce";
import { jobService } from "@/services/job.service";

import HeroLocationCombobox from "./HeroLocationCombobox";

const CATEGORY_PAGE_SIZE = 10;

export default function HomeHero() {
  const { data } = useMetadataStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCandidate = Boolean(user?.roles?.includes("CANDIDATE"));
  const showEmployerRecruitCta = !isCandidate;
  const employerRecruitHref = !isAuthenticated
    ? "/auth/login?redirect=/employer"
    : "/employer";
  const {
    provinces,
    districtsMap,
    loadingDistrict,
    fetchProvinces,
    fetchDistricts,
  } = useLocationStore();

  const [search, setSearch] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [categoryPage, setCategoryPage] = useState(0);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [locationPicker, setLocationPicker] = useState<
    null | "province" | "district"
  >(null);
  const suggestWrapRef = useRef<HTMLDivElement | null>(null);
  const suggestPanelRef = useRef<HTMLDivElement | null>(null);

  const districts = provinceId ? districtsMap[Number(provinceId)] || [] : [];
  const debouncedSearch = useDebounce(search, 250);
  const trimmedDebounced = debouncedSearch.trim();

  const suggestPanelStyle = useFixedDropdownPlacement(
    isSuggestOpen && trimmedDebounced.length >= 2,
    suggestWrapRef,
    960,
    true,
  );

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    if (provinceId) fetchDistricts(Number(provinceId));
  }, [provinceId, fetchDistricts]);

  const categoriesLen = (data?.categories ?? []).filter(
    (c) => c.parentId == null,
  ).length;
  const categoryPageCount = Math.max(
    1,
    Math.ceil(categoriesLen / CATEGORY_PAGE_SIZE),
  );
  const handleSearch = (overrideSearch?: string) => {
    const params = new URLSearchParams();
    const q = (overrideSearch ?? search).trim();
    if (q) params.set("search", q);
    if (provinceId) params.set("provinceId", provinceId);
    if (districtId) params.set("districtId", districtId);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearchInputChange = (value: string) => setSearch(value);

  const { data: suggestData, isFetching: isSuggestLoading } = useQuery({
    queryKey: ["jobs-suggest", trimmedDebounced],
    queryFn: () => jobService.suggestJobs(trimmedDebounced),
    enabled: trimmedDebounced.length >= 2 && isSuggestOpen,
    gcTime: 60_000,
    staleTime: 10_000,
    retry: 0,
  });

  const suggestions = suggestData?.suggestions ?? [];
  const kindLabel = (kind: string) => {
    if (kind === "skill") return "Kỹ năng";
    if (kind === "company") return "Công ty";
    if (kind === "category") return "Danh mục";
    return "Việc làm";
  };

  useEffect(() => {
    if (!isSuggestOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (suggestWrapRef.current?.contains(t)) return;
      if (suggestPanelRef.current?.contains(t)) return;
      setIsSuggestOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isSuggestOpen]);

  const highlightTokens = trimmedDebounced
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
  const highlightEscaped = highlightTokens.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const highlightSplitRe =
    highlightEscaped.length > 0
      ? new RegExp(`(${highlightEscaped.join("|")})`, "gi")
      : null;
  const highlightTokenRe =
    highlightEscaped.length > 0
      ? new RegExp(`^(${highlightEscaped.join("|")})$`, "i")
      : null;
  const highlightText = (text: string): ReactNode => {
    if (!highlightSplitRe || !highlightTokenRe) return text;
    const parts = text.split(highlightSplitRe);
    if (parts.length === 1) return text;
    return parts.map((p, idx) => {
      if (highlightTokenRe.test(p)) {
        return (
          <span key={`${idx}-${p}`} className="font-semibold text-primary">
            {p}
          </span>
        );
      }
      return <span key={`${idx}-${p}`}>{p}</span>;
    });
  };

  const categories = (data?.categories ?? []).filter((c) => c.parentId == null);
  const safeCategoryPage = Math.min(categoryPage, categoryPageCount - 1);
  const visibleCategories = categories.slice(
    safeCategoryPage * CATEGORY_PAGE_SIZE,
    safeCategoryPage * CATEGORY_PAGE_SIZE + CATEGORY_PAGE_SIZE,
  );
  const canPrevCategory = safeCategoryPage > 0;
  const canNextCategory = safeCategoryPage < categoryPageCount - 1;

  if (!data) {
    return (
      <div className="relative h-[min(380px,72vh)] animate-pulse bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 sm:h-[min(520px,85vh)]" />
    );
  }

  return (
    <section className="relative border-b border-white/5 bg-linear-to-br from-zinc-950 via-zinc-900 to-[#003d0a]/90 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-35 sm:opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,191,20,0.35), transparent)",
          }}
        />
        <div className="absolute -right-16 top-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl sm:-right-24 sm:top-20 sm:h-72 sm:w-72" />
        <div className="absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl sm:-left-20 sm:h-64 sm:w-64" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 pb-10 pt-7 sm:px-4 sm:pb-16 sm:pt-12 md:pb-20 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl px-0.5 text-center sm:px-0"
        >
          <div className="mb-3 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium leading-relaxed text-emerald-100 backdrop-blur sm:mb-4 sm:px-3.5 sm:text-xs">
            <Sparkles className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
            <span className="max-w-[min(100%,20rem)] text-balance sm:max-w-none">
              Nền tảng tuyển dụng thông minh, bảo mật, tốc độ cao
            </span>
          </div>
          <h1 className="text-balance text-[clamp(1.4rem,5vw,3.5rem)] font-bold leading-[1.28] tracking-normal sm:text-3xl sm:leading-tight sm:tracking-tight md:text-5xl md:leading-[1.1]">
            Kết nối{" "}
            <span className="bg-linear-to-r from-primary to-emerald-300 bg-clip-text text-transparent">
              nhân tài
            </span>{" "}
            <br className="hidden sm:block" aria-hidden />
            <span className="bg-linear-to-r from-primary to-emerald-300 bg-clip-text text-transparent">
              Kiến tạo
            </span>{" "}
            tương lai
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-xs leading-relaxed text-zinc-300 sm:mt-4 sm:max-w-2xl sm:text-sm md:text-base">
            Tìm việc nhanh chóng, ứng tuyển dễ dàng và bắt đầu hành trình sự
            nghiệp ngay hôm nay.
          </p>
          <div className="mx-auto mt-6 flex w-full max-w-sm flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 sm:px-5 sm:py-3 sm:w-auto"
            >
              Tìm việc ngay
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            {showEmployerRecruitCta ? (
              <Link
                href={employerRecruitHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/10 sm:px-5 sm:py-3 sm:w-auto"
              >
                <Building2 className="h-4 w-4 shrink-0" />
                Đăng tuyển dụng
              </Link>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-8 max-w-4xl sm:mt-12"
        >
          <div
            id="smart-search"
            className="flex flex-col overflow-visible rounded-xl border border-white/10 bg-white/95 shadow-2xl shadow-black/20 ring-1 ring-black/5 backdrop-blur sm:rounded-2xl md:flex-row"
          >
            <div ref={suggestWrapRef} className="relative min-w-0 flex-1">
              <input
                value={search}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onFocus={() => setIsSuggestOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setIsSuggestOpen(false);
                    handleSearch();
                  }
                  if (e.key === "Escape") {
                    setIsSuggestOpen(false);
                  }
                }}
                placeholder="Chức danh, kỹ năng, tên công ty..."
                className="w-full border-0 bg-transparent px-3.5 py-3.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 sm:px-4 sm:py-4 md:px-5 md:text-base"
              />
              {isSuggestOpen &&
                trimmedDebounced.length >= 2 &&
                typeof document !== "undefined" &&
                suggestPanelStyle &&
                createPortal(
                  <div
                    ref={suggestPanelRef}
                    style={suggestPanelStyle}
                    className="overflow-y-auto overscroll-contain rounded-lg border border-zinc-200 bg-white py-1 shadow-xl sm:rounded-xl"
                  >
                    {isSuggestLoading && (
                      <div className="px-4 py-3 text-sm text-zinc-500">
                        Đang gợi ý...
                      </div>
                    )}
                    {!isSuggestLoading && suggestions.length === 0 && (
                      <div className="px-4 py-3 text-sm text-zinc-500">
                        Không có gợi ý phù hợp
                      </div>
                    )}
                    {!isSuggestLoading &&
                      suggestions.map((s) => (
                        <button
                          key={`${s.kind}-${s.text}`}
                          type="button"
                          onClick={() => {
                            setSearch(s.text);
                            setIsSuggestOpen(false);
                            handleSearch(s.text);
                          }}
                          className="flex w-full flex-col gap-0.5 px-4 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-50"
                        >
                          <div className="line-clamp-1">
                            {highlightText(s.text)}
                          </div>
                          <div className="line-clamp-1 text-xs text-zinc-500">
                            {kindLabel(s.kind)}
                          </div>
                        </button>
                      ))}
                  </div>,
                  document.body,
                )}
            </div>
            <div className="flex min-w-0 flex-col border-t border-zinc-200 md:flex-row md:border-l md:border-t-0">
              <HeroLocationCombobox
                placeholder="Tỉnh / Thành phố"
                value={provinceId}
                options={provinces.map((p) => ({
                  id: String(p.id),
                  name: p.name,
                }))}
                onChange={(v) => {
                  setProvinceId(v);
                  setDistrictId("");
                  if (v) fetchDistricts(Number(v));
                }}
                open={locationPicker === "province"}
                onOpenChange={(o) => setLocationPicker(o ? "province" : null)}
                shellClassName="min-w-0 flex-1 border-b border-zinc-100 sm:min-w-[11rem] md:border-b-0 md:border-r"
                emptyMessage="Không có dữ liệu khu vực."
              />
              <HeroLocationCombobox
                placeholder="Quận / Huyện"
                value={districtId}
                options={districts.map((d) => ({
                  id: String(d.id),
                  name: d.name,
                }))}
                onChange={setDistrictId}
                disabled={!provinceId}
                loading={loadingDistrict}
                open={locationPicker === "district"}
                onOpenChange={(o) => setLocationPicker(o ? "district" : null)}
                iconVariant="muted"
                shellClassName="min-w-0 flex-1 sm:min-w-[11rem]"
                emptyMessage="Không có quận/huyện trong khu vực này."
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-b-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 sm:rounded-b-2xl sm:px-6 sm:py-4 md:min-w-35 md:rounded-bl-none md:rounded-r-2xl"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </div>

          <div className="mt-4 hidden min-[480px]:flex items-center justify-center gap-1.5 sm:mt-6 sm:gap-3">
            <button
              type="button"
              aria-label="Danh mục trước"
              disabled={!canPrevCategory}
              onClick={() =>
                setCategoryPage((p) => {
                  const cur = Math.min(Math.max(0, p), categoryPageCount - 1);
                  return Math.max(0, cur - 1);
                })
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-100 transition hover:border-primary/40 hover:bg-primary/15 disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex min-h-8 min-w-0 flex-1 flex-wrap justify-center gap-1.5 sm:min-h-9 sm:gap-2 sm:max-w-[min(100%,42rem)]">
              {visibleCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => router.push(`/jobs?categoryId=${c.id}`)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium leading-tight text-zinc-100 transition hover:border-primary/50 hover:bg-primary/15 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Danh mục sau"
              disabled={!canNextCategory}
              onClick={() =>
                setCategoryPage((p) => {
                  const cur = Math.min(Math.max(0, p), categoryPageCount - 1);
                  return Math.min(categoryPageCount - 1, cur + 1);
                })
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-100 transition hover:border-primary/40 hover:bg-primary/15 disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
