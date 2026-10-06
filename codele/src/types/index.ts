// 各マスの状態
export type TileStatus = 'correct' | 'present' | 'absent' | 'filled' | 'empty';

// 仮想キーボードの各キー状態
export type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

// 1マスのデータ
export interface TileData {
  letter: string;
  status: TileStatus;
}

// 単語とその解説
export interface WordData {
  word: string;    // 5文字・大文字
  meaning: string; // プログラミング的解説
}

// ゲームの進行フェーズ
export type GamePhase = 'playing' | 'won' | 'lost';

// ゲーム全体の状態
export interface GameState {
  answer: WordData;
  guesses: TileData[][];
  currentInput: string;
  currentRow: number;
  phase: GamePhase;
  keyStatuses: Record<string, KeyStatus>;
  shake: boolean;
  toastMessage: string | null;
  revealingRow: number | null;
  showResult: boolean;
  showStats: boolean;
}

// 統計データ
export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<number, number>;
}
