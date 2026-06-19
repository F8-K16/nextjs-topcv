import { create } from "zustand";

export type CompanyFilters = {
  categoryId: string;
  page: number;
};

type Store = {
  filters: CompanyFilters;
  setFilter: (key: keyof CompanyFilters, value: string | number) => void;
  resetFilters: () => void;
};

const initialFilters: CompanyFilters = {
  categoryId: "",
  page: 1,
};

export const useCompanyFilterStore = create<Store>((set) => ({
  filters: initialFilters,

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === "page" ? Number(value) : 1,
      },
    })),

  resetFilters: () => set({ filters: initialFilters }),
}));
