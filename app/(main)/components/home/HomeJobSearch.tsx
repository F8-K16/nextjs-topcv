"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useJobFilterStore } from "@/app/stores/job.store";
import { useDebounce } from "@/hooks/use-debounce";

function HomeJobSearchInner() {
  const { filters, setFilter } = useJobFilterStore();
  const [value, setValue] = useState(
    () => useJobFilterStore.getState().filters.search,
  );
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    if (debounced !== filters.search) {
      setFilter("search", debounced);
    }
  }, [debounced, filters.search, setFilter]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Từ khóa tìm việc"
        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

export default function HomeJobSearch() {
  const resetNonce = useJobFilterStore((s) => s.resetNonce);
  return <HomeJobSearchInner key={resetNonce} />;
}
