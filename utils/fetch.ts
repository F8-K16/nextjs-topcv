import { cookies } from "next/headers";
import "server-only";

type NextFetchInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

export const fetchWrapper = async (
  url: string,
  requestInit: NextFetchInit = {},
) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers = new Headers(requestInit.headers || {});
  if (accessToken) {
    headers.set(`Authorization`, `Bearer ${accessToken}`);
  }

  const { next, cache: cacheOpt, ...rest } = requestInit;

  const response = await fetch(url, {
    ...rest,
    cache: cacheOpt ?? "no-store",
    ...(next ? { next } : {}),
    headers,
  });

  return response;
};
