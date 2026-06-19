import { Province } from "../stores/location.store";
import { SelectOption } from "./job.type";
import type { CategoryLite, CategoryTreeNode } from "@/lib/category-hierarchy";

export type MetadataResponse = {
  categories: CategoryLite[];
  categoryTree: CategoryTreeNode[];
  categoryParents: { id: number; name: string; slug: string }[];
  provinces: Province[];
  JOB_TYPE_OPTIONS: SelectOption[];
  EXPERIENCE_OPTIONS: SelectOption[];
  SalaryRangeOptions: SelectOption[];
};
