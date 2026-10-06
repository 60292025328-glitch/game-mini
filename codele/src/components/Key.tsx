import React from 'react';
import { KeyStatus } from '../types';

interface KeyProps {
  label: string;
  status?: KeyStatus;
  onClick: (label: string) => void;
  wide?: boolean;
}

const STATUS_STYLES: Record<KeyStatus, string> = {
  correct: 'bg-[#538d4e] text-white border-[#538d4e]',
  present: 'bg-[#b59f3b] text-white border-[#b59f3b]',
  absent:  'bg-[#3a3a3c] text-[#818384] border-[#3a3a3c]',
  unused:  'bg-[#818384] text-white border-[#818384]',
};

export const Key: React.FC<KeyProps> = ({ label, status = 'unused', onClick, wide = false }) => {
  return (
    <button
      className={`
        h-14 rounded font-bold uppercase select-none cursor-pointer
        border transition-colors duration-150
        active:scale-95 active:brightness-90
        ${wide ? 'min-w-[65px] px-1 text-sm' : 'w-[43px] text-base'}
        ${STATUS_STYLES[status]}
      `}
      onClick={() => onClick(label)}
      aria-label={label}
    >
      {label}
    </button>
  );
};
