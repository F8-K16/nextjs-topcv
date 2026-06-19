"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import CreateUserModal from "../users/CreateUserModal";
import EditUserModal from "../users/EditUserModal";

import CreateCompanyModal from "../companies/CreateCompanyModal";
import EditCompanyModal from "../companies/EditCompanyModal";

import CreateCategoryModal from "../categories/CreateCategoryModal";
import EditCategoryModal from "../categories/EditCategoryModal";

import CreateJobModal from "../jobs/CreateJobModal";
import EditJobModal from "../jobs/EditJobModal";
import ViewJobModal from "../jobs/ViewJobModal";

import { Role, User } from "@/app/types/user.type";
import { Company } from "@/app/types/company.type";
import { Category } from "@/app/types/category.type";
import { Job, SelectOption } from "@/app/types/job.type";
import CreateResumeModal from "../resumes/CreateResumeModal";
import { Resume } from "@/app/types/resume.type";
import EditResumeModal from "../resumes/EditResumeModal";
import ViewCandidateCvModal from "../resumes/ViewCandidateCvModal";

type SimpleItem = {
  id: number;
  name: string;
  parentId?: number | null;
};

type ModalDataMap = {
  "create-user": {
    roles: Role[];
  };

  "edit-user": {
    user: User;
    roles: Role[];
  };

  "create-company": {
    provinces: SimpleItem[];
    categories: SimpleItem[];
  };

  "edit-company": {
    company: Company;
    provinces: SimpleItem[];
    categories: SimpleItem[];
  };

  "create-category": undefined;

  "edit-category": {
    category: Category;
  };

  "create-job": {
    companies: SimpleItem[];
    categories: SimpleItem[];
    jobTypeOptions: SelectOption[];
    experienceOptions: SelectOption[];
  };

  "edit-job": {
    job: Job;
    companies: SimpleItem[];
    jobTypeOptions: SelectOption[];
    experienceOptions: SelectOption[];
  };

  "view-job": {
    job: Job;
  };

  "create-resume": {
    candidates: {
      id: number;
      user: {
        username: string;
        email: string;
      };
    }[];
  };

  "edit-resume": {
    resume: Resume;
    candidates: {
      id: number;
      user: {
        username: string;
        email: string;
      };
    }[];
  };

  "view-candidate-cv": {
    cvId: number;
    titleHint?: string;
    candidateLabel?: string;
  };
};

type ModalType = keyof ModalDataMap;

type ModalState =
  | { type: null }
  | {
      [K in ModalType]: {
        type: K;
        data: ModalDataMap[K];
      };
    }[ModalType];

type ModalContextType = {
  openModal: <T extends ModalType>(type: T, data: ModalDataMap[T]) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside ModalManager");
  }

  return context;
};

export default function ModalManager({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    type: null,
  });

  const openModal = <T extends ModalType>(type: T, data: ModalDataMap[T]) => {
    setModal({
      type,
      data,
    } as ModalState);
  };

  const closeModal = () => {
    setModal({ type: null });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modal.type === "create-user" && (
        <CreateUserModal onClose={closeModal} roles={modal.data.roles} />
      )}

      {modal.type === "edit-user" && (
        <EditUserModal
          onClose={closeModal}
          user={modal.data.user}
          roles={modal.data.roles}
        />
      )}

      {modal.type === "create-company" && (
        <CreateCompanyModal
          onClose={closeModal}
          provinces={modal.data.provinces}
          categories={modal.data.categories}
        />
      )}

      {modal.type === "edit-company" && (
        <EditCompanyModal
          onClose={closeModal}
          company={modal.data.company}
          provinces={modal.data.provinces}
          categories={modal.data.categories}
        />
      )}

      {modal.type === "create-category" && (
        <CreateCategoryModal onClose={closeModal} />
      )}

      {modal.type === "edit-category" && (
        <EditCategoryModal
          onClose={closeModal}
          category={modal.data.category}
        />
      )}

      {modal.type === "create-job" && (
        <CreateJobModal
          onClose={closeModal}
          companies={modal.data.companies}
          categories={modal.data.categories}
          jobTypeOptions={modal.data.jobTypeOptions}
          experienceOptions={modal.data.experienceOptions}
        />
      )}

      {modal.type === "edit-job" && (
        <EditJobModal
          onClose={closeModal}
          job={modal.data.job}
          companies={modal.data.companies}
          jobTypeOptions={modal.data.jobTypeOptions}
          experienceOptions={modal.data.experienceOptions}
        />
      )}

      {modal.type === "view-job" && (
        <ViewJobModal onClose={closeModal} job={modal.data.job} />
      )}

      {modal.type === "create-resume" && (
        <CreateResumeModal
          onClose={closeModal}
          candidates={modal.data.candidates}
        />
      )}

      {modal.type === "edit-resume" && (
        <EditResumeModal
          onClose={closeModal}
          resume={modal.data.resume}
          candidates={modal.data.candidates}
        />
      )}

      {modal.type === "view-candidate-cv" && (
        <ViewCandidateCvModal
          onClose={closeModal}
          cvId={modal.data.cvId}
          titleHint={modal.data.titleHint}
          candidateLabel={modal.data.candidateLabel}
        />
      )}
    </ModalContext.Provider>
  );
}
