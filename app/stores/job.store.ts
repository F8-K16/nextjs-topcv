import { create } from "zustand";

export type JobFilters = {
  search: string;
  provinceId: string;
  districtId: string;
  salaryRange: string;
  experienceLevel: string;
  parentCategoryId: string;
  categoryId: string;
  jobType: string;
  companyId: string;
  page: number;
};

type Store = {
  filters: JobFilters;
  resetNonce: number;
  setFilter: (key: keyof JobFilters, value: string | number) => void;
  resetFilters: () => void;
  replaceFilters: (next: Partial<JobFilters>) => void;
};

export const initialJobFilters: JobFilters = {
  search: "",
  provinceId: "",
  districtId: "",
  salaryRange: "",
  experienceLevel: "",
  parentCategoryId: "",
  categoryId: "",
  jobType: "",
  companyId: "",
  page: 1,
};

export const useJobFilterStore = create<Store>((set) => ({
  filters: { ...initialJobFilters },
  resetNonce: 0,

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === "page" ? Number(value) : 1,
      },
    })),

  resetFilters: () =>
    set((state) => ({
      filters: { ...initialJobFilters },
      resetNonce: state.resetNonce + 1,
    })),

  replaceFilters: (partial) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...partial,
        page: partial.page ?? state.filters.page ?? 1,
      },
    })),
}));
