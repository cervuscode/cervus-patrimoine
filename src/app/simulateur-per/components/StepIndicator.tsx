const STEPS = [
  { n: 1, label: "Situation" },
  { n: 2, label: "Revenus" },
  { n: 3, label: "Projet" },
  { n: 4, label: "Coordonnées" },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="h-0.5 bg-[#D4C9BE] rounded-full mb-6 relative">
        <div
          className="h-0.5 bg-[#795D48] rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / 3) * 100}%` }}
        />
      </div>
      {/* Step labels */}
      <div className="flex justify-between">
        {STEPS.map(({ n, label }) => (
          <div key={n} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-inter text-xs font-medium transition-colors duration-300 ${
                n < current
                  ? "bg-[#795D48] text-white"
                  : n === current
                  ? "bg-[#795D48] text-white ring-2 ring-[#795D48]/30 ring-offset-2"
                  : "bg-[#D4C9BE] text-[#555555]/40"
              }`}
            >
              {n < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                n
              )}
            </div>
            <span
              className={`font-inter text-[10px] uppercase tracking-wider hidden sm:block ${
                n === current ? "text-[#795D48]" : "text-[#555555]/30"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
