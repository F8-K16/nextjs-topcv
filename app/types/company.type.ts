export type Company = {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  location: string;
  status: boolean;
  provinceId?: number;
  districtId?: number;
  province?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };

  categories: {
    category: {
      id: number;
      name: string;
      slug: string;
      parentId?: number | null;
    };
  }[];

  employers?: { status: "PENDING" | "APPROVED" | "REJECTED" }[];

  _count?: {
    jobs: number;
  };

  openJobCount?: number;
};

export type CompanyResponse = {
  companies: Company[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  provinces: {
    id: number;
    name: string;
  }[];
  categories: { id: number; name: string; slug: string; parentId?: number | null }[];
  query: Record<string, string>;
};

export type CreateCompanyPayload = {
  name: string;
  website?: string;
  logo?: string;
  location: string;
  provinceId: number;
  districtId: number;
};

export type UpdateCompanyPayload = {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  location: string;
  provinceId: number;
  districtId: number;
  status: boolean;
  categoryIds: number[];
};
