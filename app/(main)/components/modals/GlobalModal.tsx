"use client";

import ApplyModal from "./ApplyModal";
import CvDraftModal from "./CvDraftModal";
import GlobalConfirmDialog from "./GlobalConfirmDialog";

export default function GlobalModal() {
  return (
    <>
      <ApplyModal />
      <CvDraftModal />
      <GlobalConfirmDialog />
    </>
  );
}
