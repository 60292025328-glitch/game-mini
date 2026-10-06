import { Stats } from '../types';

const STATS_KEY = 'codele_stats';

const DEFAULT_STATS: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
};

/**
 * LocalStorageから統計データを読み込む
 * 破損データや未保存の場合はデフォルト値を返す
 */
export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS, distribution: { ...DEFAULT_STATS.distribution } };

    const parsed = JSON.parse(raw) as Partial<Stats>;

    // 必須フィールドの検証・補完
    return {
      played: typeof parsed.played === 'number' ? parsed.played : 0,
      won: typeof parsed.won === 'number' ? parsed.won : 0,
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      maxStreak: typeof parsed.maxStreak === 'number' ? parsed.maxStreak : 0,
      distribution: {
        1: parsed.distribution?.[1] ?? 0,
        2: parsed.distribution?.[2] ?? 0,
        3: parsed.distribution?.[3] ?? 0,
        4: parsed.distribution?.[4] ?? 0,
        5: parsed.distribution?.[5] ?? 0,
        6: parsed.distribution?.[6] ?? 0,
      },
    };
  } catch {
    return { ...DEFAULT_STATS, distribution: { ...DEFAULT_STATS.distribution } };
  }
}

/**
 * 統計データをLocalStorageに保存する
 */
export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ストレージ容量超過などの場合は無視
  }
}

/**
 * ゲーム結果を反映して統計を更新する
 * @param stats 現在の統計
 * @param won   勝利したか
 * @param attempts 何回目で正解したか（1-6）
 */
export function updateStats(stats: Stats, won: boolean, attempts: number): Stats {
  const newStats: Stats = {
    played: stats.played + 1,
    won: won ? stats.won + 1 : stats.won,
    currentStreak: won ? stats.currentStreak + 1 : 0,
    maxStreak: won
      ? Math.max(stats.maxStreak, stats.currentStreak + 1)
      : stats.maxStreak,
    distribution: { ...stats.distribution },
  };

  if (won && attempts >= 1 && attempts <= 6) {
    newStats.distribution[attempts] = (newStats.distribution[attempts] ?? 0) + 1;
  }

  return newStats;
}
