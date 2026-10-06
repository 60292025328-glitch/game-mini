import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { GameState, TileData } from '../types';
import {
  createInitialState,
  evaluateGuess,
  updateKeyStatuses,
  WIN_MESSAGES,
} from '../lib/gameLogic';
import { VALID_WORDS } from '../data/words';
import { loadStats, saveStats, updateStats } from '../lib/storage';

// ---- アクション定義 ----
type GameAction =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'SET_SHAKE'; value: boolean }
  | { type: 'SET_TOAST'; message: string | null }
  | { type: 'CLEAR_TOAST' }
  | { type: 'START_NEW_GAME' }
  | { type: 'SET_REVEALING'; row: number | null }
  | { type: 'SHOW_RESULT'; value: boolean }
  | { type: 'SHOW_STATS'; value: boolean };

// ---- Reducer ----
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_LETTER': {
      if (state.phase !== 'playing') return state;
      if (state.currentInput.length >= 5) return state;
      if (state.revealingRow !== null) return state;
      return { ...state, currentInput: state.currentInput + action.letter };
    }

    case 'REMOVE_LETTER': {
      if (state.phase !== 'playing') return state;
      if (state.currentInput.length === 0) return state;
      return {
        ...state,
        currentInput: state.currentInput.slice(0, -1),
      };
    }

    case 'SUBMIT_GUESS': {
      if (state.phase !== 'playing') return state;
      if (state.revealingRow !== null) return state;

      // 5文字チェック
      if (state.currentInput.length < 5) {
        return {
          ...state,
          shake: true,
          toastMessage: 'Not enough letters',
        };
      }

      // 有効単語チェック
      if (!VALID_WORDS.has(state.currentInput.toUpperCase())) {
        return {
          ...state,
          shake: true,
          toastMessage: 'Not in word list',
        };
      }

      // 正誤判定
      const tiles: TileData[] = evaluateGuess(
        state.currentInput.toUpperCase(),
        state.answer.word
      );

      const newGuesses = [...state.guesses, tiles];
      const newKeyStatuses = updateKeyStatuses(state.keyStatuses, tiles);
      const newRow = state.currentRow + 1;
      const isWon = tiles.every((t) => t.status === 'correct');
      const isLost = !isWon && newRow >= 6;

      return {
        ...state,
        guesses: newGuesses,
        currentInput: '',
        currentRow: newRow,
        keyStatuses: newKeyStatuses,
        phase: isWon ? 'won' : isLost ? 'lost' : 'playing',
        revealingRow: state.currentRow,
        toastMessage: isWon ? WIN_MESSAGES[newRow] ?? 'Genius!' : null,
      };
    }

    case 'SET_SHAKE':
      return { ...state, shake: action.value };

    case 'SET_TOAST':
      return { ...state, toastMessage: action.message };

    case 'CLEAR_TOAST':
      return { ...state, toastMessage: null };

    case 'SET_REVEALING':
      return { ...state, revealingRow: action.row };

    case 'SHOW_RESULT':
      return { ...state, showResult: action.value };

    case 'SHOW_STATS':
      return { ...state, showStats: action.value };

    case 'START_NEW_GAME':
      return createInitialState();

    default:
      return state;
  }
}

// ---- Context ----
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  // シェイクアニメーション後に自動リセット
  useEffect(() => {
    if (state.shake) {
      const timer = setTimeout(() => dispatch({ type: 'SET_SHAKE', value: false }), 600);
      return () => clearTimeout(timer);
    }
  }, [state.shake]);

  // トーストの自動クリア（勝利メッセージは少し長め）
  useEffect(() => {
    if (state.toastMessage) {
      const isWinMsg = Object.values(WIN_MESSAGES).includes(state.toastMessage);
      const delay = isWinMsg ? 2500 : 2000;
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), delay);
      return () => clearTimeout(timer);
    }
  }, [state.toastMessage]);

  // ゲーム終了時の処理（統計保存 + リザルト表示）
  useEffect(() => {
    if (state.phase === 'won' || state.phase === 'lost') {
      const won = state.phase === 'won';
      const attempts = state.guesses.length;

      // 統計を更新・保存
      const stats = loadStats();
      const newStats = updateStats(stats, won, attempts);
      saveStats(newStats);

      // アニメーション完了後にリザルトモーダルを表示
      const delay = 1800;
      const timer = setTimeout(() => dispatch({ type: 'SHOW_RESULT', value: true }), delay);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // フリップアニメーション完了後に revealingRow をリセット
  useEffect(() => {
    if (state.revealingRow !== null) {
      const timer = setTimeout(
        () => dispatch({ type: 'SET_REVEALING', row: null }),
        1600 // 5マス × 0.3s + バッファ
      );
      return () => clearTimeout(timer);
    }
  }, [state.revealingRow]);

  // キーボードイベントのリスナー登録
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toUpperCase();

      if (key === 'ENTER') {
        dispatch({ type: 'SUBMIT_GUESS' });
      } else if (key === 'BACKSPACE') {
        dispatch({ type: 'REMOVE_LETTER' });
      } else if (/^[A-Z]$/.test(key)) {
        dispatch({ type: 'ADD_LETTER', letter: key });
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
