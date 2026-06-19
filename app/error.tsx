"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white">Đã có lỗi xảy ra</h2>

        <p className="text-gray-300 text-sm leading-relaxed">
          {error.message || "Không thể tải dữ liệu. Vui lòng thử lại sau."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/30"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}
