import React from 'react';
import { useGame } from '../context/GameContext';

export const Header: React.FC = () => {
  const { dispatch } = useGame();

  return (
    <header className="w-full border-b border-[#3a3a3c] flex items-center justify-between px-4 py-2 max-w-[500px] mx-auto">
      {/* 空スペース（右ボタンとのバランス用） */}
      <div className="w-8" />

      {/* タイトル */}
      <div className="text-center">
        <h1 className="text-white font-bold text-2xl tracking-[0.2em] font-mono">CODELE</h1>
        <p className="text-[#818384] text-[10px] tracking-widest uppercase">Programming Wordle</p>
      </div>

      {/* 統計ボタン */}
      <button
        className="text-[#818384] hover:text-white transition-colors duration-150 p-1"
        onClick={() => dispatch({ type: 'SHOW_STATS', value: true })}
        aria-label="Statistics"
        title="Statistics"
      >
        {/* バーグラフアイコン */}
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="14" width="4" height="8" rx="1" />
          <rect x="9" y="9" width="4" height="13" rx="1" />
          <rect x="16" y="4" width="4" height="18" rx="1" />
        </svg>
      </button>
    </header>
  );
};
