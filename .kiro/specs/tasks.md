# Codele 実装タスク一覧

## フェーズ概要

| フェーズ | 内容 | タスク数 |
|---------|------|---------|
| Phase 1 | プロジェクトセットアップ | 3 |
| Phase 2 | データ・ロジック層 | 3 |
| Phase 3 | コアUIコンポーネント | 4 |
| Phase 4 | インタラクション・アニメーション | 3 |
| Phase 5 | 結果・統計機能 | 3 |
| Phase 6 | 仕上げ・品質向上 | 2 |
| **合計** | | **18** |

---

## Phase 1: プロジェクトセットアップ

### Task 1-1: Vite + React + TypeScript プロジェクト初期化

**説明:** `npm create vite@latest` で `codele` プロジェクトを作成し、基本設定を整える。

**手順:**
1. `npm create vite@latest codele -- --template react-ts` を実行
2. Tailwind CSS をインストール・設定する
   - `npm install -D tailwindcss postcss autoprefixer`
   - `npx tailwindcss init -p`
   - `tailwind.config.ts` の `content` にパスを設定
3. `index.css` に Tailwind directives を追記

**完了条件:**
- [ ] `npm run dev` でブラウザに初期画面が表示される
- [ ] Tailwindクラスが適用される（例: `bg-red-500` が効く）

---

### Task 1-2: 型定義ファイルの作成

**説明:** `src/types/index.ts` に全体で使用する型を定義する。

**作成する型:**
- `TileStatus`, `KeyStatus`
- `TileData`, `WordData`
- `GamePhase`, `GameState`
- `Stats`

**完了条件:**
- [ ] `src/types/index.ts` が作成されている
- [ ] TypeScript エラーなし

---

### Task 1-3: ディレクトリ構成の雛形作成

**説明:** `src/` 配下の各ディレクトリとファイルを空ファイルとして作成する。

**作成するディレクトリ/ファイル:**
```
src/
  data/words.ts
  lib/gameLogic.ts
  lib/storage.ts
  context/GameContext.tsx
  components/Header.tsx
  components/Board.tsx
  components/Row.tsx
  components/Tile.tsx
  components/Keyboard.tsx
  components/Key.tsx
  components/ResultModal.tsx
  components/StatsModal.tsx
  components/Toast.tsx
  components/ProgressBar.tsx
```

**完了条件:**
- [ ] 全ファイルが存在する（空またはプレースホルダー実装）

---

## Phase 2: データ・ロジック層

### Task 2-1: 単語リストデータの作成

**説明:** `src/data/words.ts` に 50語以上のプログラミング用語と解説を定義する。

**要件:**
- 全て5文字の英単語（大文字）
- `WordData[]` 型の `WORD_LIST` 配列をexport
- 入力バリデーション用 `VALID_WORDS: Set<string>` をexport

**収録カテゴリー例:**
- 言語・ランタイム: SWIFT, SCALA, PYTHO → 注：5文字厳守
- データ構造: ARRAY, STACK, QUEUE, GRAPH, TREES
- キーワード: ASYNC, AWAIT, CONST, YIELD, CLASS, SUPER
- ツール・技術: REACT, REDUX, VITE, LINUX, NGINX

**収録単語リスト（最低50語）:**
```
REACT, ARRAY, CLASS, ASYNC, AWAIT, STACK, QUEUE, PROXY,
SWIFT, CACHE, SCOPE, FETCH, YIELD, CONST, REGEX, QUERY,
MODAL, REDUX, HOOKS, LOOPS, SUPER, PATCH, TOKEN, SERVE,
GRAPH, TREES, INDEX, CLONE, MERGE, TRUNK, BUILD, REPOS,
PIXEL, PARSE, BYTES, CODEC, DRAIN, EVENT, FATAL, GRANT,
HTTPS, INPUT, MUTEX, NODES, OUPUT, ROUTE, STATE, TYPES,
DEBUG, EAGER
```

**完了条件:**
- [ ] 50語以上が定義されている
- [ ] 全て5文字であることを確認
- [ ] 各単語に意味・解説テキストが付与されている
- [ ] `VALID_WORDS` Set が正しく生成されている

---

### Task 2-2: ゲームロジック関数の実装

**説明:** `src/lib/gameLogic.ts` に純粋関数としてゲームロジックを実装する。

**実装する関数:**

```typescript
// 正誤判定（Wordle互換・重複文字対応）
export function evaluateGuess(guess: string, answer: string): TileData[]

// キーボード状態の更新
export function updateKeyStatuses(
  current: Record<string, KeyStatus>,
  tiles: TileData[]
): Record<string, KeyStatus>

// ランダム単語の選択
export function getRandomWord(): WordData

// 初期GameStateの生成
export function createInitialState(): GameState
```

**完了条件:**
- [ ] `evaluateGuess` が重複文字を含む全テストケースで正しく動作する
- [ ] `updateKeyStatuses` が優先度ルール（correct > present > absent）を守る
- [ ] TypeScript エラーなし

---

### Task 2-3: LocalStorage ユーティリティの実装

**説明:** `src/lib/storage.ts` に統計データの読み書き関数を実装する。

**実装する関数:**

```typescript
export function loadStats(): Stats
export function saveStats(stats: Stats): void
export function updateStats(stats: Stats, won: boolean, attempts: number): Stats
```

**要件:**
- `loadStats` は try/catch でラップし、エラー時はデフォルト統計を返す
- `saveStats` は `JSON.stringify` でシリアライズして保存
- キー名: `'codele_stats'`

**完了条件:**
- [ ] 統計データが正しく保存・復元される
- [ ] 破損データに対してデフォルト値が返される

---

## Phase 3: コアUIコンポーネント

### Task 3-1: GameContext の実装

**説明:** `src/context/GameContext.tsx` に `useReducer` ベースのゲーム状態管理を実装する。

**実装内容:**
1. `GameAction` 型（全アクションのunion）の定義
2. `gameReducer` 関数の実装（全アクションに対応）
3. `GameContext` の作成と `GameProvider` コンポーネントの実装
4. `useGame()` カスタムフックのexport
5. `useEffect` でキーボードイベントリスナーを登録

**SUBMIT_GUESSアクションの処理フロー:**
1. 5文字チェック → エラー処理
2. 有効単語チェック → エラー処理
3. evaluateGuess 呼び出し
4. guesses 更新、currentInput リセット
5. keyStatuses 更新
6. 勝敗判定 → phase 更新

**完了条件:**
- [ ] 全アクションが期待通りに動作する
- [ ] キーボードイベントで文字入力・削除・確定ができる
- [ ] 状態がコンポーネント間で共有される

---

### Task 3-2: Board / Row / Tile コンポーネントの実装

**説明:** ゲームグリッドを表示するコンポーネント群を実装する。

**Board.tsx:**
- 6行のRowを描画
- currentRow, guesses, currentInput, revealingRow を GameContext から取得

**Row.tsx:**
- 5つのTileを描画
- Props: `tiles: TileData[]`, `isRevealing?: boolean`, `shake?: boolean`
- shake が true のとき `animate-shake` クラスを付与

**Tile.tsx:**
- Props: `letter: string`, `status: TileStatus`, `isRevealing?: boolean`, `delay?: number`
- status に応じた背景色・ボーダースタイルを適用
- isRevealing が true のとき `animation-delay: delay * 0.3s` でフリップアニメーション

**完了条件:**
- [ ] 6×5グリッドが正しく表示される
- [ ] 入力中の文字がグリッドに反映される
- [ ] 色が status に応じて正しく切り替わる

---

### Task 3-3: Keyboard コンポーネントの実装

**説明:** `src/components/Keyboard.tsx` と `src/components/Key.tsx` を実装する。

**Keyboard.tsx:**
- QWERTY 3段レイアウトを定数配列で定義
- 各キーに `keyStatuses` を渡す

**Key.tsx:**
- Props: `letter: string`, `status: KeyStatus`, `onClick: (letter: string) => void`, `wide?: boolean`
- status に応じた背景色の切り替え
- クリックで `dispatch` を呼び出す
- Enter/Backspace は `wide = true` で幅広表示

**完了条件:**
- [ ] QWERTY配列のキーボードが表示される
- [ ] 仮想キーボードのタップ/クリックで入力できる
- [ ] 打鍵済みキーに色が反映される

---

### Task 3-4: Header コンポーネントの実装

**説明:** アプリ上部のヘッダーを実装する。

**表示要素:**
- ゲームタイトル「Codele」（等幅フォント）
- サブタイトル「Programming Wordle」
- 統計アイコンボタン（クリックで StatsModal を開く）

**完了条件:**
- [ ] ヘッダーが正しく表示される
- [ ] 統計ボタンをクリックすると StatsModal が開く

---

## Phase 4: インタラクション・アニメーション

### Task 4-1: カスタムアニメーションの実装

**説明:** `src/index.css` にゲーム固有のアニメーションを追加し、Tailwind の設定で `animate-*` クラスとして使えるようにする。

**実装するアニメーション:**
- `animate-flip` : タイルのフリップ（色変化と連動）
- `animate-shake` : 不正入力時の行シェイク
- `animate-bounce-tile` : 正解時のバウンス
- `animate-slide-down` : トーストのスライドイン
- `animate-pop` : キー押下のスケールポップ

**tailwind.config.ts:**
```typescript
extend: {
  animation: {
    'shake': 'shake 0.5s ease-in-out',
    'flip': 'flip 0.5s ease-in-out forwards',
    'bounce-tile': 'bounceTile 1s ease-in-out',
    'slide-down': 'slideDown 0.3s ease-out',
    'pop': 'pop 0.1s ease-in-out',
  },
  keyframes: { /* ... */ }
}
```

**完了条件:**
- [ ] 全アニメーションが意図通りに動作する
- [ ] フリップ時の色変化タイミングが正しい（50%時点で色変更）
- [ ] ステガー（遅延）が各タイルに正しく適用される

---

### Task 4-2: Toast コンポーネントの実装

**説明:** エラーメッセージや通知を表示するトーストを実装する。

**表示ケース:**
- "Not enough letters" （5文字未満でEnter）
- "Not in word list" （無効単語）
- "Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!" （正解時の称賛）

**動作:**
- `toastMessage` が null でなければフェードイン表示
- 2秒後に自動でフェードアウト → `CLEAR_TOAST` dispatch

**完了条件:**
- [ ] エラー時にトーストが表示される
- [ ] 2秒後に自動消去される

---

### Task 4-3: フリップアニメーションの統合

**説明:** SUBMIT_GUESS 後の判定結果表示をアニメーション付きで行う。

**フロー:**
1. SUBMIT_GUESS で `revealingRow` をセット
2. `Row` コンポーネントが `revealingRow === rowIndex` のとき各Tileにステガーアニメーションを適用
3. 最後のTile（5枚目）のアニメーション完了後（≈1.5秒）に `revealingRow` をnullに戻す
4. Win/Lost時はその後にResultModalを表示

**完了条件:**
- [ ] 判定結果が左から順番にフリップ表示される
- [ ] アニメーション完了まで次の入力が受け付けられない（またはUIが適切にブロックされる）

---

## Phase 5: 結果・統計機能

### Task 5-1: ResultModal コンポーネントの実装

**説明:** ゲーム終了時に表示するモーダルダイアログを実装する。

**表示内容:**
- Win/Lose バッジ
- 結果メッセージ（試行回数 or 正解単語）
- 正解単語の解説テキスト
- 統計サマリー（勝率・連勝数）
- リトライボタン

**スタイル:**
- ダークオーバーレイ背景（`bg-black/70`）
- 中央モーダル（`bg-[#1a1a1a]`, rounded）
- スムーズなスケールイン表示アニメーション

**完了条件:**
- [ ] Win/Lose 両ケースで正しく表示される
- [ ] 解説テキストが表示される
- [ ] リトライボタンで新ゲームが始まる
- [ ] モーダル外クリックで閉じない（ゲーム終了まで継続）

---

### Task 5-2: StatsModal コンポーネントの実装

**説明:** 統計情報を表示するモーダルを実装する。

**表示内容:**
- 総プレイ回数
- 勝率（%）
- 現在の連勝数
- 最高連勝数
- 試行回数別の勝利分布バーグラフ

**ProgressBar.tsx:**
- Props: `attempt: number`, `count: number`, `maxCount: number`, `isAnswer?: boolean`
- 幅は `count / maxCount * 100%` で計算
- `isAnswer` のとき緑色で表示

**完了条件:**
- [ ] 統計データが正しく表示される
- [ ] 分布バーの幅が相対的に正しい
- [ ] ヘッダーの統計ボタンで開閉できる

---

### Task 5-3: 統計の更新ロジック統合

**説明:** ゲーム終了時に統計を更新してLocalStorageに保存するロジックを GameContext に統合する。

**フロー:**
1. `phase` が `won` または `lost` に変化したとき（useEffect）
2. `loadStats()` で現在統計を読み込む
3. `updateStats()` で更新
4. `saveStats()` で保存

**完了条件:**
- [ ] ゲームをプレイするたびに統計が正しく更新される
- [ ] ページリロード後も統計が保持される
- [ ] 連勝数が正しくインクリメント/リセットされる

---

## Phase 6: 仕上げ・品質向上

### Task 6-1: レスポンシブデザインの調整

**説明:** モバイル表示を含む全デバイスでの表示を最適化する。

**調整箇所:**
- グリッドマスサイズのレスポンシブ調整（`w-[14vw] h-[14vw] max-w-[62px] max-h-[62px]`）
- キーボードキーサイズのレスポンシブ調整
- フォントサイズのレスポンシブ調整
- モーダルの画面幅対応

**完了条件:**
- [ ] スマートフォン幅（375px〜）で快適に操作できる
- [ ] タブレット・PC幅でも崩れない
- [ ] 仮想キーボードが指で押せるサイズを保つ

---

### Task 6-2: 最終動作確認・ポリッシュ

**説明:** 全機能の結合テストと細部の調整を行う。

**確認項目:**
- [ ] 正常プレイフロー（入力 → 判定 → 結果）が一通り動作する
- [ ] 不正入力（短い単語、存在しない単語）のエラーハンドリングが機能する
- [ ] 物理キーボード・仮想キーボード両方で正常動作する
- [ ] ページリロード後に統計データが保持されている
- [ ] 全アニメーションが意図通りに動作する
- [ ] コンソールに警告・エラーが出ていない
- [ ] `npm run build` でビルドエラーが発生しない

---

## 実装優先順序サマリー

```
Phase 1 (セットアップ)
  → Task 1-1 → Task 1-2 → Task 1-3

Phase 2 (ロジック)
  → Task 2-1 (単語データ) → Task 2-2 (ゲームロジック) → Task 2-3 (Storage)

Phase 3 (コアUI)
  → Task 3-1 (GameContext) → Task 3-2 (Board/Row/Tile)
  → Task 3-3 (Keyboard) → Task 3-4 (Header)

Phase 4 (アニメーション)
  → Task 4-1 (CSS) → Task 4-2 (Toast) → Task 4-3 (フリップ統合)

Phase 5 (結果・統計)
  → Task 5-1 (ResultModal) → Task 5-2 (StatsModal) → Task 5-3 (統計統合)

Phase 6 (仕上げ)
  → Task 6-1 (レスポンシブ) → Task 6-2 (最終確認)
```
