"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";

type Props = {
  initialSearch?: string;
};

export default function JobsSearchBar({ initialSearch = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialSearch);
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    const next = debounced.trim();
    const current = searchParams.get("search") ?? "";
    if (current === next) return;

    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("search", next);
    else params.delete("search");

    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
  }, [debounced, router, searchParams]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400"
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Từ khóa, kỹ năng, công ty..."
        className="w-full rounded-2xl border border-zinc-200/95 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none ring-1 ring-zinc-100/80 transition placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        autoComplete="off"
      />
    </div>
  );
}
