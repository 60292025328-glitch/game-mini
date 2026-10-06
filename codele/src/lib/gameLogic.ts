import { TileData, TileStatus, KeyStatus, WordData, GameState } from '../types';
import { WORD_LIST } from '../data/words';

/**
 * Wordle互換の正誤判定アルゴリズム（重複文字対応）
 * 1st pass: exact match（緑）を確定
 * 2nd pass: 残り文字にあれば黄、なければ灰
 */
export function evaluateGuess(guess: string, answer: string): TileData[] {
  const result: TileData[] = Array(5)
    .fill(null)
    .map((_, i) => ({ letter: guess[i], status: 'absent' as TileStatus }));

  const answerLetters = answer.split('');
  const used = Array(5).fill(false); // answerの各文字が使用済みかどうか

  // 1st pass: 完全一致（緑）
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answerLetters[i]) {
      result[i].status = 'correct';
      used[i] = true;
    }
  }

  // 2nd pass: 部分一致（黄）または不一致（灰）
  for (let i = 0; i < 5; i++) {
    if (result[i].status === 'correct') continue;

    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === answerLetters[j]) {
        result[i].status = 'present';
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

// KeyStatusの優先度（高いほど上書き優先）
const STATUS_PRIORITY: Record<KeyStatus, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  unused: 0,
};

/**
 * キーボードの各キー状態を更新する
 * 優先度: correct > present > absent（より確実な情報を保持）
 */
export function updateKeyStatuses(
  current: Record<string, KeyStatus>,
  tiles: TileData[]
): Record<string, KeyStatus> {
  const next = { ...current };

  for (const tile of tiles) {
    const letter = tile.letter;
    const newStatus = tile.status === 'correct' || tile.status === 'present' || tile.status === 'absent'
      ? tile.status
      : 'absent';

    const currentPriority = STATUS_PRIORITY[next[letter] ?? 'unused'];
    const newPriority = STATUS_PRIORITY[newStatus];

    if (newPriority > currentPriority) {
      next[letter] = newStatus;
    }
  }

  return next;
}

/**
 * ランダムにお題単語を選択する
 */
export function getRandomWord(): WordData {
  const idx = Math.floor(Math.random() * WORD_LIST.length);
  return WORD_LIST[idx];
}

/**
 * 初期のゲーム状態を生成する
 */
export function createInitialState(): GameState {
  return {
    answer: getRandomWord(),
    guesses: [],
    currentInput: '',
    currentRow: 0,
    phase: 'playing',
    keyStatuses: {},
    shake: false,
    toastMessage: null,
    revealingRow: null,
    showResult: false,
    showStats: false,
  };
}

/**
 * 勝利時の称賛メッセージ（試行回数に応じて変化）
 */
export const WIN_MESSAGES: Record<number, string> = {
  1: 'Genius! 🧠',
  2: 'Magnificent! 🌟',
  3: 'Impressive! ✨',
  4: 'Splendid! 👏',
  5: 'Great! 🎉',
  6: 'Phew! 😅',
};
