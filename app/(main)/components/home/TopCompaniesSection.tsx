import Image from "next/image";
import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";

import type { Company } from "@/app/types/company.type";
import { formatGeographyLine } from "@/utils/helper";

export default function TopCompaniesSection({
  companies,
}: {
  companies: Company[];
}) {
  if (!companies.length) return null;

  return (
    <section className="py-10 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="mb-10 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Đối tác
          </p>
          <div className="flex flex-row flex-nowrap items-center justify-between gap-3">
            <h2 className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
              Công ty đang tuyển mạnh
            </h2>
            <Link
              href="/companies"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="group flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-50 ring-1 ring-zinc-100">
                  <Image
                    src={c.logo || "/images/logo-default.png"}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-primary">
                    {c.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                    {formatGeographyLine(
                      c.location,
                      c.district?.name,
                      c.province?.name,
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1 font-medium text-zinc-800">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  {c.openJobCount ?? c._count?.jobs ?? 0} tin đang mở
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
