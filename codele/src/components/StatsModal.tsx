import React from 'react';
import { useGame } from '../context/GameContext';
import { loadStats } from '../lib/storage';
import { ProgressBar } from './ProgressBar';

export const StatsModal: React.FC = () => {
  const { state, dispatch } = useGame();
  if (!state.showStats) return null;

  const stats = loadStats();
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(...Object.values(stats.distribution));

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
      onClick={() => dispatch({ type: 'SHOW_STATS', value: false })}
    >
      <div
        className="bg-[#1a1a1a] border border-[#3a3a3c] rounded-xl p-6 w-[90vw] max-w-[420px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg tracking-widest uppercase">Statistics</h2>
          <button
            className="text-[#818384] hover:text-white text-xl leading-none"
            onClick={() => dispatch({ type: 'SHOW_STATS', value: false })}
            aria-label="Close stats"
          >
            ✕
          </button>
        </div>

        {/* 数値サマリー */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Played', value: stats.played },
            { label: 'Win %', value: winRate },
            { label: 'Streak', value: stats.currentStreak },
            { label: 'Max Streak', value: stats.maxStreak },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-white text-2xl font-bold">{value}</span>
              <span className="text-[#818384] text-xs text-center mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* 分布グラフ */}
        <div className="mb-2">
          <h3 className="text-[#818384] text-xs uppercase tracking-widest mb-3">Guess Distribution</h3>
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ProgressBar
                key={n}
                attempt={n}
                count={stats.distribution[n] ?? 0}
                maxCount={maxDist}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
