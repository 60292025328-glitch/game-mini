import React from 'react';
import { useGame } from '../context/GameContext';

export const Toast: React.FC = () => {
  const { state } = useGame();
  const { toastMessage } = state;

  if (!toastMessage) return null;

  return (
    <div
      className="
        fixed top-16 left-1/2 -translate-x-1/2 z-50
        bg-white text-[#111] font-bold text-sm
        px-4 py-2 rounded shadow-lg
        animate-slide-down pointer-events-none
      "
      role="alert"
      aria-live="assertive"
    >
      {toastMessage}
    </div>
  );
};
