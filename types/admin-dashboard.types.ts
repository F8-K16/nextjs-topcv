export type AdminDashboardSummary = {
  userCount: number;
  companyCount: number;
  jobCount: number;
  applicationCount: number;
  resumeCount: number;
  savedJobCount: number;
  pendingEmployerCount: number;
  categoryCount: number;
  employerApprovedCount: number;
  candidateCount: number;
  skillCount: number;
  jobsActive: number;
  jobsExpired: number;
  pendingJobs: number;
  revenueVnd: number | null;
  chart: {
    months: string[];
    users: number[];
    jobs: number[];
    applications: number[];
  };
  chartDaily: {
    days: string[];
    users: number[];
    jobs: number[];
    applications: number[];
  };
  topHotJobCategories: {
    id: number;
    name: string;
    applicationCount: number;
  }[];
  topCompanies: {
    id: number;
    name: string;
    logo: string | null;
    location: string;
    _count: { jobs: number };
  }[];
  recentJobs: {
    id: number;
    title: string;
    createdAt: string | null;
    deadline: string | null;
    moderationStatus: string;
    isFeatured: boolean;
    workLocation: string | null;
    minSalary: number | null;
    maxSalary: number | null;
    company: {
      id: number;
      name: string;
      logo: string | null;
      location: string;
    };
  }[];
  recentUsers: {
    id: number;
    email: string;
    username: string;
    avatar: string | null;
    createdAt: string | null;
    isVerified: boolean;
    isBlocked: boolean;
    userRoles: { role: { name: string } }[];
  }[];
};
