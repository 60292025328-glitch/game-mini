import React from 'react';
import { TileData } from '../types';
import { Tile } from './Tile';

interface RowProps {
  tiles: TileData[];
  isRevealing?: boolean;
  shake?: boolean;
}

export const Row: React.FC<RowProps> = ({ tiles, isRevealing = false, shake = false }) => {
  return (
    <div
      className={`flex gap-1.5 ${shake ? 'animate-shake' : ''}`}
      role="row"
    >
      {tiles.map((tile, i) => (
        <Tile
          key={i}
          letter={tile.letter}
          status={tile.status}
          isRevealing={isRevealing}
          delay={i * 300}
        />
      ))}
    </div>
  );
};
