import { MapPinned } from "lucide-react";
import { formatGeographyLine } from "@/utils/helper";

type Props = {
  companyName: string;
  location: string;
  district?: string | null;
  province?: string | null;
};

function embedSrc(fullAddress: string): string {
  const q = encodeURIComponent(fullAddress);
  return `https://maps.google.com/maps?q=${q}&hl=vi&z=15&output=embed`;
}

export default function CompanyMapSection({
  companyName,
  location,
  district,
  province,
}: Props) {
  const line = formatGeographyLine(location, district ?? "", province ?? "");
  const query = [companyName, line].filter(Boolean).join(", ");

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/80 shadow-inner">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-4 py-3">
        <MapPinned className="h-4 w-4 text-[#00b14f]" aria-hidden />
        <h3 className="text-sm font-bold text-gray-900">Bản đồ</h3>
      </div>
      <div className="relative aspect-16/10 w-full bg-zinc-200 md:aspect-21/9">
        <iframe
          title={`Bản đồ — ${companyName}`}
          src={embedSrc(query)}
          className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.02] saturate-[0.95]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="px-4 py-2 text-center text-[11px] text-gray-500">
        Vị trí gợi ý theo địa chỉ công ty; có thể chỉnh trên Google Maps.
      </p>
    </div>
  );
}
