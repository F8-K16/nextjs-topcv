const rawApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export const API_BASE_URL = normalizedApiBaseUrl
  ? normalizedApiBaseUrl.endsWith("/api")
    ? normalizedApiBaseUrl
    : `${normalizedApiBaseUrl}/api`
  : "";

export const SOCKET_IO_BASE_URL = (() => {
  const explicit = (process.env.NEXT_PUBLIC_SOCKET_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (explicit) return explicit;
  if (!normalizedApiBaseUrl) return "";
  return normalizedApiBaseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
})();
