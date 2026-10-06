import React from 'react';
import { TileData, TileStatus } from '../types';
import { Row } from './Row';
import { useGame } from '../context/GameContext';

const TOTAL_ROWS = 6;
const WORD_LENGTH = 5;

// 現在入力中の行をTileData[]に変換
function buildCurrentRow(input: string): TileData[] {
  const tiles: TileData[] = [];
  for (let i = 0; i < WORD_LENGTH; i++) {
    tiles.push({
      letter: input[i] ?? '',
      status: input[i] ? 'filled' : 'empty',
    });
  }
  return tiles;
}

// 空行（未入力）
function buildEmptyRow(): TileData[] {
  return Array(WORD_LENGTH)
    .fill(null)
    .map(() => ({ letter: '', status: 'empty' as TileStatus }));
}

export const Board: React.FC = () => {
  const { state } = useGame();
  const { guesses, currentInput, currentRow, revealingRow, shake } = state;

  const rows: TileData[][] = [];

  // 確定済みの行
  for (let i = 0; i < guesses.length; i++) {
    rows.push(guesses[i]);
  }

  // 現在の入力行（ゲーム中のみ）
  if (state.phase === 'playing') {
    rows.push(buildCurrentRow(currentInput));
  }

  // 残りの空行
  while (rows.length < TOTAL_ROWS) {
    rows.push(buildEmptyRow());
  }

  return (
    <div
      className="flex flex-col gap-1.5 my-4"
      role="grid"
      aria-label="Codele board"
    >
      {rows.map((tiles, rowIdx) => (
        <Row
          key={rowIdx}
          tiles={tiles}
          isRevealing={revealingRow === rowIdx}
          shake={rowIdx === currentRow && shake}
        />
      ))}
    </div>
  );
};
