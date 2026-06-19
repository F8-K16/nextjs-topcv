export type Resume = {
  id: number;
  title: string;
  fileUrl: string;
  createdAt?: string;
  updatedAt?: string;
  candidate: {
    id: number;
    user: {
      username: string;
      email: string;
      userPhone?: {
        phone: string;
      } | null;
      cvs?: {
        id: number;
        title: string;
        status: "DRAFT" | "COMPLETED";
        updatedAt?: string;
        template?: {
          id: number;
          name: string;
        };
      }[];
    };
  };
};

export type ResumePageResponse = {
  resumes: Resume[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems?: number;
  };
  candidates: {
    id: number;
    user: {
      username: string;
      email: string;
    };
  }[];
};

export type CreateResumePayload = {
  title: string;
  fileUrl: string;
  candidateId: number;
};
