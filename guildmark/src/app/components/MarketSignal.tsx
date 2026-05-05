interface MarketSignalProps {
  strength: 1 | 2 | 3 | 4 | 5;
}

export function MarketSignal({ strength }: MarketSignalProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-sm ${
            bar <= strength ? "bg-[#3B82F6]" : "bg-slate-300 dark:bg-slate-700"
          }`}
          style={{ height: `${bar * 3 + 4}px` }}
        />
      ))}
    </div>
  );
}
