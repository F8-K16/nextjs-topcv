export const ACCESS_DENIED_SEARCH_PARAM = "accessDenied";
export const ACCESS_DENIED_VALUE = "1";
export const ACCESS_DENIED_FALLBACK_PATH = "/";

export function appendAccessDeniedParam(target: URL): URL {
  target.searchParams.set(ACCESS_DENIED_SEARCH_PARAM, ACCESS_DENIED_VALUE);
  return target;
}

/**
 * Build a same-origin URL to redirect to after a permission check fails.
 *
 * Prefers the referer (so the user stays where they were) and falls back to
 * the site root. The forbidden path itself is never used as a target to avoid
 * loops. The `accessDenied` flag is always attached so the destination page
 * can surface a toast.
 */
export function buildAccessDeniedRedirectUrl(input: {
  origin: string;
  forbiddenPathname: string;
  referer?: string | null;
}): URL {
  const { origin, forbiddenPathname, referer } = input;

  let target: URL | null = null;

  if (referer) {
    try {
      const ref = new URL(referer);
      if (ref.origin === origin && ref.pathname !== forbiddenPathname) {
        target = new URL(ref.pathname + ref.search, origin);
      }
    } catch {
      target = null;
    }
  }

  if (!target) {
    target = new URL(ACCESS_DENIED_FALLBACK_PATH, origin);
  }

  return appendAccessDeniedParam(target);
}

/**
 * Build a path (pathname + query) on the current origin for client-side
 * `router.replace` calls when a guard denies access.
 */
export function buildAccessDeniedClientPath(
  fallback: string = ACCESS_DENIED_FALLBACK_PATH,
): string {
  const url = new URL(fallback, "http://placeholder.local");
  appendAccessDeniedParam(url);
  return `${url.pathname}${url.search}`;
}
