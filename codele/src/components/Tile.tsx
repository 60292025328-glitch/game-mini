import React from 'react';
import { TileStatus } from '../types';

interface TileProps {
  letter: string;
  status: TileStatus;
  isRevealing?: boolean;
  delay?: number; // ms
}

// ステータスに対応するスタイル（フリップ後の色）
const STATUS_STYLES: Record<TileStatus, string> = {
  correct: 'bg-[#538d4e] border-[#538d4e] text-white',
  present: 'bg-[#b59f3b] border-[#b59f3b] text-white',
  absent:  'bg-[#3a3a3c] border-[#3a3a3c] text-white',
  filled:  'bg-transparent border-[#818384] text-white',
  empty:   'bg-transparent border-[#3a3a3c] text-[#3a3a3c]',
};

export const Tile: React.FC<TileProps> = ({ letter, status, isRevealing = false, delay = 0 }) => {
  const isRevealed = status === 'correct' || status === 'present' || status === 'absent';

  return (
    <div
      className={`
        relative w-[62px] h-[62px] sm:w-[14vw] sm:h-[14vw] sm:max-w-[62px] sm:max-h-[62px]
        border-2 flex items-center justify-center
        text-2xl sm:text-3xl font-bold uppercase select-none
        transition-transform duration-100
        ${letter && !isRevealed ? 'scale-110 duration-50' : 'scale-100'}
        ${STATUS_STYLES[status]}
        ${isRevealing ? 'animate-flip' : ''}
      `}
      style={isRevealing ? { animationDelay: `${delay}ms` } : undefined}
      aria-label={letter ? `${letter} ${status}` : 'empty'}
    >
      <span
        className="block"
        style={isRevealing ? {
          animation: `flipInner 0.5s ease-in-out ${delay}ms both`,
        } : undefined}
      >
        {letter}
      </span>
    </div>
  );
};
