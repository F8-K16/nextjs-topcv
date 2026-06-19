import { API_BASE_URL } from "@/lib/api-base-url";

export const locationService = {
  async getProvinces() {
    try {
      const res = await fetch(`${API_BASE_URL}/provinces`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    } catch {
      throw new Error("Có lỗi khi tải danh sách tỉnh/thành");
    }
  },

  async getDistrictsByProvince(provinceId: number) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/provinces/${provinceId}/districts`,
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    } catch {
      throw new Error("Có lỗi khi tải danh sách quận/huyện");
    }
  },
};
