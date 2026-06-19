"use client";

import Image from "next/image";
import { useMemo } from "react";

type UserAvatarProps = {
  avatar?: string | null;
  username?: string | null;
  size: number;
};

function toDisplayableAvatarUrl(
  raw: string | null | undefined,
): string | undefined {
  if (raw == null) return undefined;
  const t = String(raw).trim();
  if (!t) return undefined;

  if (t.startsWith("/") && !t.startsWith("//")) {
    return t;
  }
  if (t.startsWith("data:") || t.startsWith("blob:")) {
    return undefined;
  }

  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      return undefined;
    }
    if (u.hostname === "res.cloudinary.com" && u.protocol === "https:") {
      return t;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function useCacheBustedImageSrc(avatar: string | null | undefined) {
  return useMemo(() => {
    const displayable = toDisplayableAvatarUrl(avatar);
    if (!displayable) return undefined;
    const sep = displayable.includes("?") ? "&" : "?";
    let h = 5381;
    for (let i = 0; i < displayable.length; i++) {
      h = (h * 33 + displayable.charCodeAt(i)) >>> 0;
    }
    return `${displayable}${sep}v=${h.toString(36)}`;
  }, [avatar]);
}

export default function UserAvatar({
  avatar,
  username,
  size = 40,
}: UserAvatarProps) {
  const firstLetter = username?.charAt(0)?.toUpperCase() || "?";
  const imgSrc = useCacheBustedImageSrc(avatar);

  const placeholderStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`,
  };

  if (imgSrc) {
    return (
      <Image
        src={imgSrc}
        alt={username ? `Ảnh đại diện ${username}` : "Ảnh đại diện"}
        width={size}
        height={size}
        sizes={`${size}px`}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={placeholderStyle}
      className="rounded-full bg-green-500 text-white flex items-center justify-center font-semibold"
    >
      {firstLetter}
    </div>
  );
}
