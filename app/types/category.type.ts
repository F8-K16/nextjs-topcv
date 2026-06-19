export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  parentCategoryId?: number;
  parentCategory?: { id: number; name: string; slug: string };
  _count?: {
    jobs: number;
    companies?: number;
  };
};
