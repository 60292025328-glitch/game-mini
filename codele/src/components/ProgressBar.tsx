import React from 'react';

interface ProgressBarProps {
  attempt: number;
  count: number;
  maxCount: number;
  isCurrent?: boolean; // 今回の正解試行回数かどうか
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  attempt,
  count,
  maxCount,
  isCurrent = false,
}) => {
  const widthPct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#818384] w-4 text-right flex-shrink-0">{attempt}</span>
      <div className="flex-1 bg-[#3a3a3c] rounded-sm overflow-hidden h-6">
        <div
          className={`h-full flex items-center justify-end pr-2 text-xs font-bold text-white rounded-sm transition-all duration-500
            ${isCurrent ? 'bg-[#538d4e]' : 'bg-[#818384]'}
            ${widthPct === 0 ? 'min-w-0' : 'min-w-[24px]'}
          `}
          style={{ width: `${Math.max(widthPct, count > 0 ? 8 : 0)}%` }}
        >
          {count > 0 ? count : ''}
        </div>
      </div>
    </div>
  );
};
