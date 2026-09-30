import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthBackHome({
  className = "mb-6",
}: {
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-primary ${className}`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Quay lại trang chủ
    </Link>
  );
}
