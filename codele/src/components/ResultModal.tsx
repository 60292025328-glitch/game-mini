import React from 'react';
import { useGame } from '../context/GameContext';
import { loadStats } from '../lib/storage';
import { ProgressBar } from './ProgressBar';

export const ResultModal: React.FC = () => {
  const { state, dispatch } = useGame();
  if (!state.showResult) return null;

  const { phase, answer, guesses } = state;
  const won = phase === 'won';
  const attempts = guesses.length;

  const stats = loadStats();
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(...Object.values(stats.distribution));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="bg-[#1a1a1a] border border-[#3a3a3c] rounded-xl p-6 w-[90vw] max-w-[440px] shadow-2xl animate-scale-in">

        {/* 結果バッジ */}
        <div className="text-center mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2
              ${won ? 'bg-[#538d4e] text-white' : 'bg-[#3a3a3c] text-[#818384]'}`}
          >
            {won ? '✓ Solved' : '✗ Failed'}
          </span>

          {won ? (
            <p className="text-white text-lg font-bold mt-1">
              Solved in {attempts} {attempts === 1 ? 'try' : 'tries'}!
            </p>
          ) : (
            <div className="mt-1">
              <p className="text-[#818384] text-sm">The answer was</p>
              <p className="text-white text-2xl font-bold tracking-widest font-mono mt-1">
                {answer.word}
              </p>
            </div>
          )}
        </div>

        {/* 解説 */}
        <div className="bg-[#111] border border-[#3a3a3c] rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#538d4e] font-mono font-bold text-base">{answer.word}</span>
            <span className="text-[#818384] text-xs">— プログラミング用語</span>
          </div>
          <p className="text-[#cccccc] text-sm leading-relaxed">{answer.meaning}</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Played', value: stats.played },
            { label: 'Win %', value: winRate },
            { label: 'Streak', value: stats.currentStreak },
            { label: 'Best', value: stats.maxStreak },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-white text-xl font-bold">{value}</span>
              <span className="text-[#818384] text-xs text-center mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* 分布バー */}
        <div className="mb-5">
          <h3 className="text-[#818384] text-xs uppercase tracking-widest mb-2">Guess Distribution</h3>
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ProgressBar
                key={n}
                attempt={n}
                count={stats.distribution[n] ?? 0}
                maxCount={maxDist}
                isCurrent={won && n === attempts}
              />
            ))}
          </div>
        </div>

        {/* リトライボタン */}
        <button
          className="w-full py-3 bg-[#538d4e] hover:bg-[#6aaf64] text-white font-bold rounded-lg text-base uppercase tracking-widest transition-colors duration-150"
          onClick={() => dispatch({ type: 'START_NEW_GAME' })}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
