"use client";

import { useEffect, useMemo } from "react";

import { CvListItem } from "@/app/types/cv.type";
import { useModalStore } from "@/app/stores/modal.store";

export function useCvDraftPrompt(params: {
  cvs: CvListItem[];
  enabled: boolean;
}) {
  const openModal = useModalStore((s) => s.openModal);

  const draft = useMemo(() => {
    const drafts = params.cvs.filter((cv) => cv.status === "DRAFT");
    drafts.sort((a, b) => {
      const at = new Date(a.lastEditedAt).getTime();
      const bt = new Date(b.lastEditedAt).getTime();
      return bt - at;
    });
    return drafts[0] ?? null;
  }, [params.cvs]);

  const draftStableKey = draft ? `${draft.id}:${draft.lastEditedAt}` : null;

  useEffect(() => {
    if (!params.enabled) return;
    if (!draft || !draftStableKey) return;

    openModal("cv-draft", {
      cvId: draft.id,
      cvTitle: draft.title,
      cvThumbnailUrl: draft.template?.thumbnailUrl ?? null,
      cvLastEditedAt: draft.lastEditedAt,
    });
  }, [params.enabled, draft, draftStableKey, openModal]);
}

