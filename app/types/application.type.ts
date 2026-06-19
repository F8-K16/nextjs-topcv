export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "ACCEPTED"
  | "REJECTED";

export type MyApplication = {
  id: number;
  createdAt: string;
  status: ApplicationStatus;
  aiMatchStatus?: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  aiMatchScore?: number | null;
  aiMatchUpdatedAt?: string | null;
  aiMatchError?: string | null;
  jobId: number;
  resumeId: number | null;
  job: {
    id: number;
    title: string;
    jobType: string;
    experienceLevel: string;
    company: {
      id: number;
      name: string;
      logo?: string | null;
      location?: string | null;
    };
    category: { id: number; name: string };
  };
  resume: {
    id: number;
    title: string;
    fileUrl: string;
  } | null;
};
