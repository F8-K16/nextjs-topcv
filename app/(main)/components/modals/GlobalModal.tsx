"use client";

import ApplyModal from "./ApplyModal";
import CvDraftModal from "./CvDraftModal";
import GlobalConfirmDialog from "./GlobalConfirmDialog";
import LoginModal from "./LoginModal";

export default function GlobalModal() {
  return (
    <>
      <LoginModal />
      <ApplyModal />
      <CvDraftModal />
      <GlobalConfirmDialog />
    </>
  );
}
