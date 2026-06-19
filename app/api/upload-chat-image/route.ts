import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { cookies } from "next/headers";
import { authService } from "@/services/auth.service";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const getClientIp = (request: Request) => {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await authService.getProfile(accessToken);
    const userId =
      (profile.success ? (profile.data as { data?: { id?: unknown } }) : null)
        ?.data?.id ?? null;
    if (!profile.success || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `upload-chat-image:${String(userId)}:${getClientIp(request)}`;
    const now = Date.now();
    const current = rateLimitStore.get(key);
    if (!current || now >= current.resetAt) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    } else {
      if (current.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 },
        );
      }
      current.count += 1;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Ảnh tối đa 8MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "Chats",
      resource_type: "image",
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch {
    return NextResponse.json(
      { error: "Tải ảnh lên thất bại" },
      { status: 500 },
    );
  }
}
