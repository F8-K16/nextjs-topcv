import { create } from "zustand";
import { locationService } from "@/services/location.service";

export type Province = {
  id: number;
  name: string;
};

export type District = {
  id: number;
  name: string;
};

type LocationStore = {
  provinces: Province[];
  districtsMap: Record<number, District[]>;
  loadingDistrict: boolean;

  fetchProvinces: () => Promise<void>;
  fetchDistricts: (provinceId: number) => Promise<void>;
};

export const useLocationStore = create<LocationStore>((set, get) => ({
  provinces: [],
  districtsMap: {},
  loadingDistrict: false,

  fetchProvinces: async () => {
    if (get().provinces.length > 0) return;

    const data = await locationService.getProvinces();
    set({ provinces: data });
  },

  fetchDistricts: async (provinceId) => {
    const { districtsMap } = get();

    if (districtsMap[provinceId]) {
      return districtsMap[provinceId];
    }
    set({ loadingDistrict: true });

    try {
      const data = await locationService.getDistrictsByProvince(provinceId);
      set({
        districtsMap: {
          ...districtsMap,
          [provinceId]: data,
        },
      });
      return data;
    } finally {
      set({ loadingDistrict: false });
    }
  },
}));
