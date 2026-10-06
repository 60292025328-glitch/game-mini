import React from 'react';
import { Key } from './Key';
import { useGame } from '../context/GameContext';
import { KeyStatus } from '../types';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export const Keyboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { keyStatuses } = state;

  const handleKey = (label: string) => {
    if (label === 'ENTER') {
      dispatch({ type: 'SUBMIT_GUESS' });
    } else if (label === '⌫') {
      dispatch({ type: 'REMOVE_LETTER' });
    } else {
      dispatch({ type: 'ADD_LETTER', letter: label });
    }
  };

  return (
    <div className="flex flex-col gap-1.5 items-center w-full max-w-[500px] px-1">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1.5 justify-center">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === '⌫';
            const status: KeyStatus = keyStatuses[key] ?? 'unused';
            return (
              <Key
                key={key}
                label={key}
                status={status}
                onClick={handleKey}
                wide={isWide}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
