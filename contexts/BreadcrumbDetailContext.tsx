"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  type ReactNode,
} from "react";

type Ctx = {
  detailLabel: string | null;
  setDetailLabel: (v: string | null) => void;
};

const BreadcrumbDetailContext = createContext<Ctx | null>(null);

export function BreadcrumbDetailProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [detailLabel, setDetailLabelState] = useState<string | null>(null);
  const setDetailLabel = useCallback((v: string | null) => {
    setDetailLabelState(v);
  }, []);

  return (
    <BreadcrumbDetailContext.Provider value={{ detailLabel, setDetailLabel }}>
      {children}
    </BreadcrumbDetailContext.Provider>
  );
}

export function useBreadcrumbDetail() {
  const ctx = useContext(BreadcrumbDetailContext);
  if (!ctx) {
    throw new Error(
      "useBreadcrumbDetail must be used within BreadcrumbDetailProvider",
    );
  }
  return ctx;
}

export function BreadcrumbDetailLabel({ children }: { children: string }) {
  const { setDetailLabel } = useBreadcrumbDetail();
  useLayoutEffect(() => {
    setDetailLabel(children);
    return () => setDetailLabel(null);
  }, [children, setDetailLabel]);
  return null;
}
