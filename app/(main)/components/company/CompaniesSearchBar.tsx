"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  initialSearch?: string;
};

export default function CompaniesSearchBar({ initialSearch = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialSearch);

  useEffect(() => {
    setValue(initialSearch);
  }, [initialSearch]);

  const submit = () => {
    const params = new URLSearchParams(searchParams.toString());
    const q = value.trim();
    if (q) params.set("search", q);
    else params.delete("search");

    params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `/companies?${qs}` : "/companies");
  };

  return (
    <form
      className="flex w-full items-center gap-3 rounded-full bg-white p-2 shadow-[0_8px_28px_rgba(16,24,40,0.08)] ring-1 ring-zinc-200/60"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Nhập tên công ty"
          className="h-11 w-full rounded-full bg-transparent pl-11 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          autoComplete="off"
        />
      </div>
      <button
        type="submit"
        className="h-11 shrink-0 rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:brightness-95"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
