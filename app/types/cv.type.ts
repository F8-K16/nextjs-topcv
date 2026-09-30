export type CvBlockType = "text" | "multiline";

export type CvTemplateBlock = {
  id: string;
  type: CvBlockType;
  bindingPath: string;
  defaultValue?: string;
};

export type CvTemplateSection = {
  id: string;
  label: string;
  bindingPath: string;
  itemBlocks?: CvTemplateBlock[];
  defaultItem?: Record<string, string>;
  sampleItems?: Record<string, string>[];
};

export type CvTemplateData = {
  layout?: "single-column" | "two-column" | string;
  meta?: Record<string, unknown>;
  blocks?: CvTemplateBlock[];
  sections?: CvTemplateSection[];
};

export type CvTemplateSummary = {
  id: number;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CvTemplate = CvTemplateSummary & {
  templateData: CvTemplateData;
};

export type CvStatus = "DRAFT" | "COMPLETED";

export type CvContent = Record<string, unknown>;

export type Cv = {
  id: number;
  userId: number;
  templateId: number;
  title: string;
  status: CvStatus;
  content: CvContent;
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string;
  template: CvTemplate;
};

export type PublicCv = Pick<
  Cv,
  "id" | "title" | "status" | "content" | "template"
>;

export type CvListItem = {
  id: number;
  title: string;
  status: CvStatus;
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string;
  template: {
    id: number;
    name: string;
    thumbnailUrl?: string | null;
  };
};

export type CreateCvPayload = {
  templateId: number;
  title?: string;
};

export type UpdateCvPayload = {
  title?: string;
  status?: CvStatus;
  content?: CvContent;
};
