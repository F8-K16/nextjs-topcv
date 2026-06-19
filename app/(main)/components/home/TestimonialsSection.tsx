const quotes = [
  {
    name: "Minh Anh",
    role: "Frontend Engineer",
    text: "Trải nghiệm mượt mà, theo dõi trạng thái rõ ràng. Giao diện sạch, đúng gu.",
  },
  {
    name: "Tuấn Đạt",
    role: "HR Business Partner",
    text: "Đăng tin nhanh, lọc ứng viên theo kinh nghiệm và khu vực rất tiện cho team tuyển dụng.",
  },
  {
    name: "Lan Chi",
    role: "Product Designer",
    text: "Tìm việc remote/on-site linh hoạt. Gợi ý việc làm phù hợp là điểm cộng lớn.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-linear-to-b from-zinc-50 to-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Phản hồi
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900 md:text-3xl">
            Ứng viên & nhà tuyển dụng nói gì?
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <figure
              key={q.name}
              className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-zinc-700">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {q.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">{q.name}</div>
                  <div className="text-xs text-zinc-500">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
