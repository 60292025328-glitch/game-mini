# Codele 設計書

## 1. 技術スタック

| 分類 | 採用技術 | バージョン（目標） |
|------|---------|-----------------|
| フレームワーク | React | 18.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 3.x |
| ビルドツール | Vite | 5.x |
| 状態管理 | React Context + useReducer | （ライブラリ不要） |
| 永続化 | LocalStorage | Web標準API |

外部UIライブラリは導入せず、Tailwind CSS + カスタムCSSアニメーションのみで実装する。

---

## 2. ディレクトリ構成

```
codele/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── favicon.ico
└── src/
    ├── main.tsx                  # エントリーポイント
    ├── App.tsx                   # ルートコンポーネント・Context Provider
    ├── index.css                 # Tailwind directives + カスタムアニメーション
    │
    ├── types/
    │   └── index.ts              # 共通型定義
    │
    ├── data/
    │   └── words.ts              # 単語リスト・解説データ
    │
    ├── lib/
    │   ├── gameLogic.ts          # 正誤判定ロジック（純粋関数）
    │   └── storage.ts            # LocalStorage読み書きユーティリティ
    │
    ├── context/
    │   └── GameContext.tsx       # ゲーム状態管理（Context + useReducer）
    │
    └── components/
        ├── Header.tsx            # タイトル・統計ボタン
        ├── Board.tsx             # 5×6グリッド全体
        ├── Row.tsx               # グリッド1行（5マス）
        ├── Tile.tsx              # グリッド1マス
        ├── Keyboard.tsx          # 仮想キーボード全体
        ├── Key.tsx               # 仮想キーボード1キー
        ├── ResultModal.tsx       # 結果ダイアログ
        ├── StatsModal.tsx        # 統計ダイアログ
        ├── Toast.tsx             # エラー・通知トースト
        └── ProgressBar.tsx       # 統計の試行回数分布バー
```

---

## 3. 型定義

```typescript
// src/types/index.ts

// 各マスの文字状態
export type TileStatus = 'correct' | 'present' | 'absent' | 'filled' | 'empty';

// 各キーの判定状態
export type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

// 1マスのデータ
export interface TileData {
  letter: string;
  status: TileStatus;
}

// 単語データ
export interface WordData {
  word: string;       // 5文字大文字
  meaning: string;    // プログラミング的解説
}

// ゲームの進行状態
export type GamePhase = 'playing' | 'won' | 'lost';

// ゲーム全体の状態
export interface GameState {
  answer: WordData;                        // 今日のお題
  guesses: TileData[][];                   // 確定済み推測（最大6行）
  currentInput: string;                    // 現在入力中の文字列
  currentRow: number;                      // 現在の行インデックス (0-5)
  phase: GamePhase;
  keyStatuses: Record<string, KeyStatus>;  // キーボードの各キー状態
  shake: boolean;                          // シェイクアニメーショントリガー
  toastMessage: string | null;             // トーストメッセージ
  revealingRow: number | null;             // フリップアニメーション中の行
}

// 統計データ
export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<number, number>;    // { 1: 3, 2: 5, ... }
}
```

---

## 4. コンポーネント設計

### 4.1 App.tsx
- `GameProvider` で全体をラップする
- `<Header />`, `<Board />`, `<Keyboard />` を縦に配置
- `<ResultModal />`, `<StatsModal />`, `<Toast />` をオーバーレイとして配置

### 4.2 GameContext.tsx（状態管理）

**State:** `GameState`（上記型定義参照）

**Actions（useReducer）:**

| アクション | 説明 |
|-----------|------|
| `ADD_LETTER` | currentInputに1文字追加（5文字未満の場合のみ） |
| `REMOVE_LETTER` | currentInputの末尾を削除 |
| `SUBMIT_GUESS` | 入力を確定・判定・状態更新 |
| `SET_SHAKE` | シェイクアニメーションのON/OFF |
| `SET_TOAST` | トーストメッセージのセット |
| `CLEAR_TOAST` | トーストをクリア |
| `START_NEW_GAME` | ゲームをリセットして新しいお題を選択 |
| `SET_REVEALING` | フリップアニメーション中の行を設定 |

**ゲームロジックフロー（SUBMIT_GUESS）:**
1. currentInputが5文字か確認 → 不足なら `SET_SHAKE` + `SET_TOAST("Not enough letters")`
2. 有効単語リストに存在するか確認 → 存在しなければ `SET_SHAKE` + `SET_TOAST("Not in word list")`
3. `evaluateGuess(input, answer)` を呼び出して TileData[] を生成
4. guessesに追加、currentInputをリセット、keyStatusesを更新
5. 正解なら `phase = 'won'`、6回目で不正解なら `phase = 'lost'`

**副作用（useEffect）:**
- キーボードイベントのリスナー登録・解除
- `phase` が won/lost に変化したとき → 統計を更新してLocalStorageに保存 → 1.5秒後にResultModalを表示

### 4.3 Board.tsx / Row.tsx / Tile.tsx

```
Board
└── Row × 6
    └── Tile × 5
```

- `Row` は `currentRow` かどうかによって `currentInput` を参照するか、`guesses[rowIndex]` を参照するかを切り替える
- `Tile` は `status` に応じて Tailwind クラスを切り替える
- フリップアニメーションは `revealingRow === rowIndex` のとき、各Tileに `animation-delay` をステガー付与して順番にフリップ

### 4.4 Keyboard.tsx / Key.tsx

- QWERTY配列を定数配列として定義
- `Key` は `keyStatuses[letter]` を参照してスタイルを決定
- クリックで `dispatch({ type: 'ADD_LETTER', letter })` または `REMOVE_LETTER` / `SUBMIT_GUESS` を呼び出す

### 4.5 ResultModal.tsx

表示内容:
- ゲーム結果（Won/Lost）バッジ
- Win時: "Solved in N tries!" メッセージ
- Lose時: "The answer was: XXXXX" 
- 正解単語の解説テキスト
- 統計サマリー（勝率・連勝）
- リトライボタン

### 4.6 Toast.tsx

- `toastMessage` が null でない場合に画面上部に表示
- 自動で2〜3秒後にフェードアウト（useEffect + setTimeout）

---

## 5. ゲームロジック詳細

### 5.1 evaluateGuess(guess: string, answer: string): TileData[]

Wordle互換の正誤判定アルゴリズム（重複文字対応）:

```
1. 第1パス: 全マスをチェックし、exact match（緑）を確定させる
   - answer側の使用済み文字をマークする

2. 第2パス: 緑未確定のマスについて、answerの残り文字にあれば黄、なければ灰

例:
  answer = "ARRAY"
  guess  = "ALARM"
  
  A[0] vs A[0] → 緑（exact）
  L[1] vs R[1] → L は answer に残っているか？ → L=0個 → 灰
  A[2] vs R[2] → A は answer の残り（A残1個）にあるか？ → 黄
  R[3] vs A[3] → R は answer の残り（R残1個）にあるか？ → 黄
  M[4] vs Y[4] → M は answer に含まれない → 灰
```

### 5.2 updateKeyStatuses(keyStatuses, newTiles): Record<string, KeyStatus>

- 既存のstatusより強い状態（correct > present > absent）のみ上書き
- 優先度: `correct`(3) > `present`(2) > `absent`(1) > `unused`(0)

---

## 6. データ設計

### 6.1 単語データ構造（src/data/words.ts）

```typescript
export const WORD_LIST: WordData[] = [
  { word: 'REACT', meaning: 'UIコンポーネントを構築するためのJavaScriptライブラリ。Facebookが開発。' },
  { word: 'ARRAY', meaning: '複数の値を順序付きで格納するデータ構造。インデックスでアクセス可能。' },
  { word: 'CLASS', meaning: 'オブジェクト指向プログラミングにおけるオブジェクトの設計図・テンプレート。' },
  { word: 'ASYNC', meaning: '非同期処理を宣言するキーワード。awaitと組み合わせてPromiseを扱う。' },
  // ... 合計50語以上
];

// 入力バリデーション用（お題リストを含む全有効単語）
export const VALID_WORDS: Set<string> = new Set([...WORD_LIST.map(w => w.word), ...EXTRA_VALID_WORDS]);
```

### 6.2 LocalStorage スキーマ

```json
{
  "codele_stats": {
    "played": 15,
    "won": 12,
    "currentStreak": 3,
    "maxStreak": 5,
    "distribution": { "1": 1, "2": 3, "3": 5, "4": 2, "5": 1, "6": 0 }
  }
}
```

---

## 7. スタイル・アニメーション設計

### 7.1 カラーパレット

| 役割 | カラーコード | Tailwindクラス相当 |
|------|------------|-----------------|
| 背景 | `#111111` | `bg-[#111111]` |
| グリッド背景 | `#1a1a1a` | `bg-[#1a1a1a]` |
| マス枠（空） | `#3a3a3c` | `border-[#3a3a3c]` |
| マス枠（入力中） | `#818384` | `border-[#818384]` |
| キーボード背景 | `#818384` | `bg-[#818384]` |
| Correct（緑） | `#538d4e` | `bg-[#538d4e]` |
| Present（黄） | `#b59f3b` | `bg-[#b59f3b]` |
| Absent（灰） | `#3a3a3c` | `bg-[#3a3a3c]` |
| テキスト（メイン） | `#ffffff` | `text-white` |
| テキスト（サブ） | `#818384` | `text-[#818384]` |

### 7.2 アニメーション定義（index.css）

```css
/* タイル フリップアニメーション */
@keyframes flip-in {
  0%   { transform: rotateX(0deg); }
  50%  { transform: rotateX(-90deg); }
}
@keyframes flip-out {
  50%  { transform: rotateX(-90deg); }
  100% { transform: rotateX(0deg); }
}

/* 行シェイクアニメーション */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 50%, 90% { transform: translateX(-4px); }
  30%, 70% { transform: translateX(4px); }
}

/* 正解時バウンスアニメーション */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* トーストのスライドイン */
@keyframes slide-down {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

### 7.3 レスポンシブ対応

- グリッドのマスサイズ: PC=62px、モバイル=14vw
- 仮想キーボードキーサイズ: PC=43px幅、モバイル=7vw
- `max-w-lg` 程度でセンタリングし、画面幅に追従

---

## 8. セキュリティ・品質

- LocalStorageの読み込み時は try/catch でラップし、破損データに対してデフォルト値を返す
- 単語リストはビルド時にバンドルされるためXSS等のリスクはない
- TypeScriptの strict モードを有効化する
