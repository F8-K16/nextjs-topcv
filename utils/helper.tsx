import { EXPERIENCE_OPTIONS } from "@/app/types/job.type";
import { resolveSubmitError } from "@/lib/submit-error";

type ApiError = {
  message?: string;
  errors?: Record<string, string>;
};

export const formatPhone = (phone?: string) => {
  if (!phone) return "N/A";

  if (phone.startsWith("+84")) return phone;

  if (phone.startsWith("0")) {
    return "+84" + phone.slice(1);
  }

  return phone;
};

export const formatDate = (date?: string | null) => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

export const handleAxiosError = (error: unknown): ApiError => {
  const r = resolveSubmitError(error);
  return {
    message: r.toastMessage,
    errors: r.fieldErrors,
  };
};

export const formatSalaryShort = (min?: number, max?: number) => {
  if (!min && !max) return "Thỏa thuận";

  const toTrieu = (value: number) => Math.round(value / 1_000_000);
  if (min && max) {
    return `${toTrieu(min)} - ${toTrieu(max)} triệu`;
  }
  if (min) {
    return `Từ ${toTrieu(min)} triệu`;
  }

  return `Đến ${toTrieu(max!)} triệu`;
};

export const formatCurrency = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
};

export const parseCurrency = (value: string) => {
  return Number(value.replace(/\D/g, "")) || undefined;
};

export function formatExperience(level: string) {
  const key = String(level ?? "").trim().toUpperCase();
  const found = EXPERIENCE_OPTIONS.find((o) => o.value === key);
  return found?.label ?? level;
}

export function formatJobType(type: string) {
  const map: Record<string, string> = {
    FULL_TIME: "Toàn thời gian",
    PART_TIME: "Bán thời gian",
    FREELANCE: "Freelance",
  };

  return map[type] || type;
}

function normalizeGeoToken(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatGeographyLine(
  ...parts: (string | null | undefined)[]
): string {
  const segments: string[] = [];
  for (const part of parts) {
    if (part == null) continue;
    const trimmed = String(part).replace(/\s+/g, " ").trim();
    if (!trimmed) continue;
    for (const chunk of trimmed
      .split(/[·•]/g)
      .map((s) => s.trim())
      .filter(Boolean)) {
      segments.push(chunk);
    }
  }

  const out: string[] = [];
  for (const seg of segments) {
    const n = normalizeGeoToken(seg);
    let skip = false;
    for (let i = 0; i < out.length; i++) {
      const existing = out[i];
      const en = normalizeGeoToken(existing);
      if (n === en) {
        skip = true;
        break;
      }
      if (en.length >= n.length && en.includes(n)) {
        skip = true;
        break;
      }
      if (n.length > en.length && n.includes(en)) {
        out[i] = seg;
        skip = true;
        break;
      }
    }
    if (!skip) out.push(seg);
  }

  return out.join(", ");
}

export const roleMap: Record<string, string> = {
  ADMIN: "Quản trị viên",
  MODERATOR: "Kiểm duyệt",
  SUPPORT: "Hỗ trợ",
  EMPLOYER: "Nhà tuyển dụng",
  CANDIDATE: "Ứng viên",
};
