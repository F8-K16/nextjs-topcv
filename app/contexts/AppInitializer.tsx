"use client";

import useAuth from "../../hooks/useAuth";

export const AppInitializer = () => {
  useAuth();
  return null;
};
