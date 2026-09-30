"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useMetadataStore } from "@/app/stores/metadata.store";
import type { Province } from "@/app/stores/location.store";
import {
  recommendationFormSchema,
  type RecommendationFormValues,
} from "@/app/validations/recommendation.schema";
import {
  fetchRecommendationProfile,
  fetchSkillsPublic,
  putRecommendationProfile,
} from "@/services/recommendation.service";
import {
  STALE_RECOMMENDATION_PROFILE_MS,
  STALE_SKILLS_PUBLIC_MS,
} from "@/lib/query-stale-time";
import { invalidateJobsRecommendedQueries } from "@/lib/recommendation-queries";
import { formatCurrency, parseCurrency } from "@/utils/helper";
import CandidateOnlyNotice from "@/app/(main)/components/CandidateOnlyNotice";
import { useAuthenticatedNonCandidate } from "@/hooks/useAuthenticatedNonCandidate";
import { useAuthStore } from "@/app/stores/auth.store";
import {
  buildCategoryTree,
  type CategoryTreeNode,
} from "@/lib/category-hierarchy";
import { ChevronDown, Search, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-base-url";

const defaultForm: RecommendationFormValues = {
  desiredMinSalary: undefined,
  desiredMaxSalary: undefined,
  jobType: "",
  experienceLevel: "",
  preferredProvinceId: "",
  preferredDistrictId: "",
  isOpenToRemote: false,
  skillIds: [],
  categoryIds: [],
};

export default function RecommendationsForm() {
  const queryClient = useQueryClient();
  const hideCandidateFeatures = useAuthenticatedNonCandidate();
  const userId = useAuthStore((s) => s.user?.id);
  const meta = useMetadataStore((s) => s.data);
  const fetchMeta = useMetadataStore((s) => s.fetchMeta);
  const [categorySearch, setCategorySearch] = useState("");
  const [openCategoryParentIds, setOpenCategoryParentIds] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    void fetchMeta();
  }, [fetchMeta]);

  const profileQuery = useQuery({
    queryKey: ["recommendation-profile", userId],
    queryFn: fetchRecommendationProfile,
    retry: false,
    enabled: !hideCandidateFeatures && !!userId,
    staleTime: STALE_RECOMMENDATION_PROFILE_MS,
  });

  const skillsQuery = useQuery({
    queryKey: ["skills-public"],
    queryFn: fetchSkillsPublic,
    staleTime: STALE_SKILLS_PUBLIC_MS,
    enabled: !hideCandidateFeatures,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: defaultForm,
  });

  const provinceId = useWatch({
    control,
    name: "preferredProvinceId",
  });
  const skillIds = useWatch({ control, name: "skillIds", defaultValue: [] });
  const categoryIds = useWatch({
    control,
    name: "categoryIds",
    defaultValue: [],
  });

  const districts = useStateDistricts(provinceId);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    const pref = p.preference;
    reset({
      desiredMinSalary: pref?.desiredMinSalary ?? undefined,
      desiredMaxSalary: pref?.desiredMaxSalary ?? undefined,
      jobType: pref?.jobType ?? "",
      experienceLevel: pref?.experienceLevel ?? "",
      preferredProvinceId: pref?.preferredProvinceId ?? "",
      preferredDistrictId: pref?.preferredDistrictId ?? "",
      isOpenToRemote: pref?.isOpenToRemote ?? false,
      skillIds: p.skillIds ?? [],
      categoryIds: p.categoryIds ?? [],
    });
  }, [profileQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: putRecommendationProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["recommendation-profile"],
      });
      await invalidateJobsRecommendedQueries(queryClient);
      toast.success("Đã lưu sở thích gợi ý");
    },
    onError: (e: unknown) => {
      const msg =
        e &&
        typeof e === "object" &&
        "response" in e &&
        e.response &&
        typeof e.response === "object" &&
        "data" in e.response &&
        e.response.data &&
        typeof e.response.data === "object" &&
        "message" in e.response.data
          ? String((e.response.data as { message?: string }).message)
          : "Không thể lưu";
      toast.error(msg);
    },
  });

  const onSubmit = (values: RecommendationFormValues) => {
    saveMutation.mutate({
      desiredMinSalary: values.desiredMinSalary ?? null,
      desiredMaxSalary: values.desiredMaxSalary ?? null,
      jobType: values.jobType === "" ? null : values.jobType,
      experienceLevel:
        values.experienceLevel === "" ? null : values.experienceLevel,
      preferredProvinceId:
        values.preferredProvinceId === ""
          ? null
          : Number(values.preferredProvinceId),
      preferredDistrictId:
        values.preferredDistrictId === ""
          ? null
          : Number(values.preferredDistrictId),
      isOpenToRemote: values.isOpenToRemote,
      skillIds: values.skillIds,
      categoryIds: values.categoryIds,
    });
  };

  const provinces = useMemo(
    () => meta?.provinces ?? ([] as Province[]),
    [meta?.provinces],
  );

  const toggleSkill = (id: number) => {
    const cur = skillIds;
    if (cur.includes(id)) {
      setValue(
        "skillIds",
        cur.filter((x) => x !== id),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue("skillIds", [...cur, id], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const setCategoryIds = (next: number[]) => {
    const deduped = [...new Set(next)];
    setValue("categoryIds", deduped, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const categories = meta?.categories;
  const categoryTree = useMemo(
    () => (categories ? buildCategoryTree(categories) : []),
    [categories],
  );

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of meta?.categories ?? []) {
      m.set(c.id, c.name);
    }
    return m;
  }, [meta?.categories]);

  const collectLeafIds = useCallback((node: CategoryTreeNode): number[] => {
    const out: number[] = [];
    const stack = [node];
    while (stack.length) {
      const cur = stack.pop()!;
      if (!cur.children.length) {
        out.push(cur.id);
        continue;
      }
      for (const child of cur.children) stack.push(child);
    }
    return out;
  }, []);

  const toggleNode = (node: CategoryTreeNode) => {
    const subtreeIds = collectLeafIds(node);
    const selectedSet = new Set(categoryIds);
    const allSelected = subtreeIds.every((id) => selectedSet.has(id));
    if (allSelected) {
      setCategoryIds(categoryIds.filter((id) => !subtreeIds.includes(id)));
      return;
    }
    setCategoryIds([...categoryIds, ...subtreeIds]);
  };

  const selectedCategorySet = useMemo(
    () => new Set(categoryIds),
    [categoryIds],
  );

  const getNodeSelectionState = useCallback(
    (node: CategoryTreeNode) => {
      const subtreeIds = collectLeafIds(node);
      const selectedCount = subtreeIds.filter((id) =>
        selectedCategorySet.has(id),
      ).length;
      const totalCount = subtreeIds.length;
      return {
        subtreeIds,
        selectedCount,
        totalCount,
        checked: totalCount > 0 && selectedCount === totalCount,
        indeterminate: selectedCount > 0 && selectedCount < totalCount,
      };
    },
    [collectLeafIds, selectedCategorySet],
  );

  const categorySearchQuery = categorySearch.trim().toLowerCase();
  const doesNodeMatch = useCallback(
    (node: CategoryTreeNode): boolean => {
      const searchNode = (current: CategoryTreeNode): boolean => {
        if (!categorySearchQuery) return true;
        if (current.name.toLowerCase().includes(categorySearchQuery)) {
          return true;
        }
        return current.children.some((child) => searchNode(child));
      };
      return searchNode(node);
    },
    [categorySearchQuery],
  );

  const visibleCategoryRoots = useMemo(
    () => categoryTree.filter((node) => doesNodeMatch(node)),
    [categoryTree, doesNodeMatch],
  );

  const selectedCategoryNames = useMemo(() => {
    return categoryIds
      .map((id) => ({ id, name: categoryNameById.get(id) ?? String(id) }))
      .filter((x) => Boolean(x.name));
  }, [categoryIds, categoryNameById]);

  if (hideCandidateFeatures) {
    return (
      <CandidateOnlyNotice>
        Cập nhật sở thích tìm việc chỉ dành cho tài khoản ứng viên. Với nhà
        tuyển dụng, hãy dùng khu vực quản lý tin và hồ sơ ứng tuyển.
      </CandidateOnlyNotice>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/80 p-6 text-sm text-red-800">
        Chỉ tài khoản ứng viên mới chỉnh được phần này.
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
        Đang tải…
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900">Kỹ năng &amp; ngành</h2>
        <p className="mt-1 text-sm text-gray-500">
          Chọn kỹ năng và danh mục việc bạn quan tâm để gợi ý chính xác hơn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Kỹ năng
          </label>
          <div className="max-h-100 overflow-y-auto rounded-xl border border-gray-200 p-3">
            {skillsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Đang tải kỹ năng…</p>
            ) : (
              <ul className="space-y-2">
                {(skillsQuery.data ?? []).map((s) => (
                  <li key={s.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={skillIds.includes(s.id)}
                        onChange={() => toggleSkill(s.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span>{s.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            Danh mục việc
          </label>
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Tìm danh mục..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {categorySearch.trim() ? (
                  <button
                    type="button"
                    onClick={() => setCategorySearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-700"
                    aria-label="Xóa tìm kiếm danh mục"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() =>
                  setValue("categoryIds", [], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                Bỏ chọn
              </button>
            </div>

            {selectedCategoryNames.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategoryNames.slice(0, 10).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setCategoryIds(categoryIds.filter((id) => id !== c.id))
                    }
                    className="group inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    title="Bấm để bỏ chọn"
                  >
                    <span className="max-w-55 truncate">{c.name}</span>
                    <X className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                  </button>
                ))}
                {selectedCategoryNames.length > 10 ? (
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                    +{selectedCategoryNames.length - 10}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                Chưa chọn danh mục nào.
              </p>
            )}

            <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
              {visibleCategoryRoots.length ? (
                <div className="space-y-2">
                  {visibleCategoryRoots.map((parent) => {
                    const selectionState = getNodeSelectionState(parent);
                    const isOpen =
                      openCategoryParentIds[parent.id] ??
                      Boolean(categorySearchQuery);
                    return (
                      <div
                        key={parent.id}
                        className="overflow-hidden rounded-lg border border-gray-200"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCategoryParentIds((prev) => ({
                              ...prev,
                              [parent.id]: !isOpen,
                            }))
                          }
                          className="flex w-full items-center justify-between gap-3 bg-gray-50 px-3 py-2 text-left"
                        >
                          <label
                            className="flex min-w-0 cursor-pointer items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectionState.checked}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate =
                                    selectionState.indeterminate;
                                }
                              }}
                              onChange={() => toggleNode(parent)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="truncate text-sm font-semibold text-gray-900">
                              {parent.name}
                            </span>
                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                              {selectionState.selectedCount}/
                              {selectionState.totalCount}
                            </span>
                          </label>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-gray-500 transition ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen ? (
                          <div className="space-y-1 border-t border-gray-100 px-2 py-2">
                            {parent.children.length ? (
                              parent.children
                                .filter((child) => doesNodeMatch(child))
                                .map((child) => {
                                  const childSelectionState =
                                    getNodeSelectionState(child);
                                  return (
                                    <label
                                      key={child.id}
                                      className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={childSelectionState.checked}
                                        ref={(el) => {
                                          if (el) {
                                            el.indeterminate =
                                              childSelectionState.indeterminate;
                                          }
                                        }}
                                        onChange={() => toggleNode(child)}
                                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="min-w-0 flex-1 text-gray-800">
                                        {child.name}
                                      </span>
                                    </label>
                                  );
                                })
                            ) : (
                              <p className="px-2 py-1 text-xs text-gray-500">
                                Chưa có danh mục con
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="p-3 text-sm text-gray-500">
                  Không tìm thấy danh mục phù hợp.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="min-sal"
            className="mb-1 block text-sm font-semibold text-gray-800"
          >
            Lương mong muốn (tối thiểu)
          </label>
          <Controller
            control={control}
            name="desiredMinSalary"
            render={({ field }) => (
              <input
                id="min-sal"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="VNĐ / tháng"
                className={inputClass}
                value={formatCurrency(field.value as number | undefined)}
                onChange={(e) => field.onChange(parseCurrency(e.target.value))}
              />
            )}
          />
          {errors.desiredMinSalary ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.desiredMinSalary.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="max-sal"
            className="mb-1 block text-sm font-semibold text-gray-800"
          >
            Lương mong muốn (tối đa)
          </label>
          <Controller
            control={control}
            name="desiredMaxSalary"
            render={({ field }) => (
              <input
                id="max-sal"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="VNĐ / tháng"
                className={inputClass}
                value={formatCurrency(field.value as number | undefined)}
                onChange={(e) => field.onChange(parseCurrency(e.target.value))}
              />
            )}
          />
          {errors.desiredMaxSalary ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.desiredMaxSalary.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Hình thức
          </label>
          <select {...register("jobType")} className={inputClass}>
            <option value="">— Không chọn —</option>
            {(meta?.JOB_TYPE_OPTIONS ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Yêu cầu kinh nghiệm
          </label>
          <select {...register("experienceLevel")} className={inputClass}>
            <option value="">— Không chọn —</option>
            {(meta?.EXPERIENCE_OPTIONS ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Tỉnh / Thành ưu tiên
          </label>
          <Controller
            control={control}
            name="preferredProvinceId"
            render={({ field }) => (
              <select
                {...field}
                value={field.value === "" ? "" : field.value}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === "" ? "" : Number(raw));
                  setValue("preferredDistrictId", "", { shouldValidate: true });
                }}
                className={inputClass}
              >
                <option value="">— Không chọn —</option>
                {provinces.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.preferredProvinceId ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.preferredProvinceId.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-800">
            Quận / Huyện
          </label>
          <Controller
            control={control}
            name="preferredDistrictId"
            render={({ field }) => (
              <select
                {...field}
                value={field.value === "" ? "" : field.value}
                onChange={(e) => {
                  const raw = e.target.value;
                  field.onChange(raw === "" ? "" : Number(raw));
                }}
                disabled={
                  provinceId === "" ||
                  provinceId === undefined ||
                  districts.loading ||
                  districts.list.length === 0
                }
                className={`${inputClass} disabled:bg-gray-50`}
              >
                <option value="">
                  {districts.loading ? "Đang tải…" : "— Chọn —"}
                </option>
                {districts.list.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
        <input
          type="checkbox"
          {...register("isOpenToRemote")}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        Có thể làm remote
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saveMutation.isPending || isSubmitting}
          className="rounded-full bg-[#00b14f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#009944] disabled:opacity-60"
        >
          {saveMutation.isPending || isSubmitting
            ? "Đang lưu…"
            : "Lưu sở thích"}
        </button>
        <Link
          href="/jobs/recommended"
          className="text-sm font-semibold text-[#00b14f] hover:underline"
        >
          Xem việc phù hợp →
        </Link>
      </div>
    </form>
  );
}

function useStateDistricts(provinceId: number | "" | undefined): {
  list: { id: number; name: string }[];
  loading: boolean;
} {
  const [list, setList] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (pid: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/provinces/${pid}/districts`,
      );
      const json = (await res.json()) as { id: number; name: string }[];
      setList(Array.isArray(json) ? json : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provinceId === "" || provinceId === undefined) {
      setList([]);
      return;
    }
    void load(Number(provinceId));
  }, [provinceId, load]);

  return { list, loading };
}
