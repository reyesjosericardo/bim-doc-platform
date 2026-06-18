interface ProgressBarProps {
  current: number;
  total: number;
  blocks: string[];
  activeBlock: number;
  onBlockClick?: (index: number) => void;
}

export function ProgressBar({ current, total, blocks, activeBlock, onBlockClick }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="mb-8">
      {/* Block stepper */}
      <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
        {blocks.map((label, i) => {
          const done = i < activeBlock;
          const active = i === activeBlock;
          return (
            <div key={i} className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => onBlockClick?.(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : done
                    ? 'bg-brand-400/20 text-brand-300 hover:bg-brand-400/30 cursor-pointer'
                    : 'bg-[#EEE9DB]/[0.07] text-[#EEE9DB]/40 cursor-default'
                }`}
                disabled={!done && !active}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? 'bg-white text-brand-600' : done ? 'bg-brand-500 text-white' : 'bg-[#EEE9DB]/12 text-[#EEE9DB]/50'
                }`}>
                  {done ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < blocks.length - 1 && (
                <div className={`w-6 sm:w-12 h-0.5 mx-1 flex-shrink-0 ${done ? 'bg-brand-400' : 'bg-[#EEE9DB]/12'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-[#EEE9DB]/12 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-code text-xs text-[#EEE9DB]/55 w-16 text-right">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}
