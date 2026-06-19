export default function AuthMarketingPanel() {
  return (
    <aside className="relative hidden w-full max-w-md shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br from-[#047857] via-emerald-700 to-zinc-900 px-10 py-14 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:min-h-0 lg:max-h-screen lg:self-start lg:overflow-y-auto xl:max-w-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(16,185,129,0.25) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/90">
          TopCV
        </p>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
          Tiếp lợi thế
          <br />
          Nối thành công
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-50/95">
          Kết nối ứng viên và nhà tuyển dụng trên một nền tảng hiện đại, minh
          bạch và thân thiện.
        </p>
      </div>
      <ul className="relative z-10 space-y-3 text-sm text-emerald-50/90">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
          Hàng nghìn tin tuyển dụng đã duyệt, cập nhật liên tục.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
          Gợi ý việc làm theo kỹ năng và khu vực của bạn.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
          Bảo mật thông tin và hỗ trợ ứng viên / NTD.
        </li>
      </ul>
    </aside>
  );
}
