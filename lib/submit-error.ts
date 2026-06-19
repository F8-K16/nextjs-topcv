import { isAxiosError } from "axios";
import { ZodError } from "zod";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
};

function flattenZodIssues(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_root";
    if (!out[path]) out[path] = issue.message;
  }
  return out;
}

function flattenApiFieldDetails(details: unknown): Record<string, string> {
  if (!details || typeof details !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(details)) {
    if (Array.isArray(v)) {
      const msg = v.filter(Boolean).join("; ");
      if (msg) out[k] = msg;
    } else if (typeof v === "string" && v.trim()) {
      out[k] = v;
    }
  }
  return out;
}

const SAFE_CODE_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  AUTH_EMAIL_NOT_VERIFIED: "Email chưa được xác thực.",
  AUTH_ACCOUNT_BLOCKED:
    "Tài khoản đang bị hạn chế. Vui lòng liên hệ quản trị viên.",
  UNAUTHORIZED: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
  AUTH_INVALID_TOKEN: "Yêu cầu không hợp lệ. Vui lòng thử lại.",
  AUTH_INVALID_REFRESH_TOKEN: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
};

/** Lỗi AI từ backend thường có message tiếng Việt hữu ích — không ghi đè bằng thông báo 500 chung. */
const AI_USER_FACING_CODES = new Set([
  "AI_DISABLED",
  "AI_NOT_CONFIGURED",
  "AI_RATE_LIMITED",
  "AI_UPSTREAM_FAILED",
  "AI_INVALID_RESPONSE",
  "AI_NETWORK_ERROR",
  "AI_BAD_REQUEST",
]);

function shouldHideRawMessage(msg: string): boolean {
  const t = msg.trim();
  return (
    /^Unauthorized$/i.test(t) ||
    /^Invalid ID$/i.test(t) ||
    /^Server Error$/i.test(t) ||
    /^Request failed with status code \d+$/i.test(t)
  );
}

export type ResolvedSubmitError = {
  toastMessage: string;
  fieldErrors: Record<string, string>;
};

function isNormalizedApiPayload(
  e: unknown,
): e is { message: string; errors?: Record<string, string> } {
  if (e === null || typeof e !== "object") return false;
  if (isAxiosError(e)) return false;
  if (e instanceof Error) return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.message === "string" &&
    (o.errors === undefined ||
      (typeof o.errors === "object" &&
        o.errors !== null &&
        !Array.isArray(o.errors)))
  );
}

export function resolveSubmitError(error: unknown): ResolvedSubmitError {
  if (error instanceof ZodError) {
    const fieldErrors = flattenZodIssues(error);
    return {
      toastMessage:
        Object.keys(fieldErrors).length > 0
          ? "Một số thông tin chưa đúng. Vui lòng kiểm tra các trường bên dưới."
          : "Dữ liệu không hợp lệ.",
      fieldErrors,
    };
  }

  if (isNormalizedApiPayload(error)) {
    return {
      toastMessage: error.message,
      fieldErrors: { ...(error.errors ?? {}) },
    };
  }

  if (!isAxiosError(error)) {
    const msg =
      error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
    return { toastMessage: msg, fieldErrors: {} };
  }

  const status = error.response?.status;
  const data = error.response?.data as ApiErrorBody | undefined;
  const code = data?.code;
  const rawMsg =
    typeof data?.message === "string" && data.message.trim()
      ? data.message.trim()
      : error.message || "Đã xảy ra lỗi";

  let fieldErrors: Record<string, string> =
    code === "VALIDATION_ERROR" ? flattenApiFieldDetails(data?.details) : {};

  if (code === "AUTH_INVALID_OLD_PASSWORD") {
    fieldErrors = {
      ...fieldErrors,
      oldPassword: "Mật khẩu hiện tại không đúng.",
    };
  }

  const hasFields = Object.keys(fieldErrors).length > 0;

  let toastMessage: string;

  const apiMsg =
    typeof data?.message === "string" && data.message.trim()
      ? data.message.trim()
      : "";

  if (code && AI_USER_FACING_CODES.has(code) && apiMsg) {
    toastMessage = apiMsg;
  } else if (status != null && status >= 500) {
    toastMessage =
      "Hệ thống đang bận hoặc gặp sự cố. Vui lòng thử lại sau ít phút.";
  } else if (code === "INTERNAL_ERROR" || code === "INTERNAL_SERVER_ERROR") {
    toastMessage =
      "Đã xảy ra lỗi phía máy chủ. Vui lòng thử lại sau.";
  } else if (code === "VALIDATION_ERROR" && hasFields) {
    toastMessage =
      "Một số trường chưa hợp lệ. Xem chi tiết bên dưới từng ô nhập.";
  } else if (code && SAFE_CODE_MESSAGES[code]) {
    toastMessage = SAFE_CODE_MESSAGES[code]!;
  } else if (status === 401 && shouldHideRawMessage(rawMsg)) {
    toastMessage = SAFE_CODE_MESSAGES.UNAUTHORIZED;
  } else if (shouldHideRawMessage(rawMsg)) {
    toastMessage = hasFields
      ? "Dữ liệu gửi lên không hợp lệ."
      : "Không thể thực hiện thao tác. Vui lòng thử lại.";
  } else {
    toastMessage = rawMsg;
  }

  return { toastMessage, fieldErrors };
}

export function applyFieldErrorsToForm<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string>,
) {
  for (const [field, message] of Object.entries(fieldErrors)) {
    if (!message || field === "_root") continue;
    setError(field as Path<T>, { type: "server", message });
  }
}

export function getErrorToastMessage(error: unknown): string {
  return resolveSubmitError(error).toastMessage;
}
