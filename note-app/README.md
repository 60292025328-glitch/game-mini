# ZatsuNote — AI自動タグ付けノートアプリ

思考を殴り書きするだけで、AIが自動でタイトル補正・要約・タグ付けを行って整理してくれるモダンなノートアプリ。

## スクリーンショット

```
┌────────────────┬──────────────────────────────┬────────────────────┐
│  左サイドバー   │       メインエディタ           │  右サイドバー(AI)  │
│                │                              │                    │
│ [新規] ボタン  │ [編集|分割|プレビュー]         │  AIアシスタント   │
│ 検索バー       │ [AIで整理✨]                  │                    │
│ ─────────────  │ ─────────────────────────── │  チャット履歴     │
│ タグ一覧       │  タイトル                    │                    │
│  #AI           │  📎 要約テキスト             │  [クイック質問]   │
│  #開発         │  🏷 タグ1  タグ2             │  要点を3つ教えて  │
│  #読書         │ ─────────────────────────── │  アクション抽出   │
│ ─────────────  │                              │                    │
│ ノート一覧     │  Markdownエディタ / プレビュー │  入力欄 [送信]    │
│  プロジェクト  │                              │                    │
│  振り返り      │                              │                    │
│  読書メモ      │                              │                    │
└────────────────┴──────────────────────────────┴────────────────────┘
```

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm / yarn / pnpm のいずれか

### インストール・起動

```bash
# 1. プロジェクトフォルダに移動
cd note-app

# 2. 依存関係をインストール
npm install

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` を開くとアプリが表示されます。

### ビルド（本番用）

```bash
npm run build
npm run start
```

## 機能一覧

### ノートCRUD
- 新規作成：左サイドバーの「新規」ボタン
- 編集：ノートを選択してメインエリアで直接編集（300ms自動保存）
- 削除：ノート一覧でホバーするとゴミ箱ボタンが表示
- タイトル・タグの手動編集も可能

### Markdownプレビュー
- **編集** / **分割**（左編集・右プレビュー） / **プレビュー** の3モード
- GFM（GitHub Flavored Markdown）対応：テーブル、チェックボックス、コードブロック等

### AIで整理（✨ボタン）
- ノート本文から自動で「タイトル」「要約（1行）」「タグ（3〜5個）」を生成
- 現在はモック実装。OpenAI APIに接続すれば本番動作する

### タグ・検索フィルタ
- 左サイドバーのタグをクリックでフィルタリング
- 検索バーでタイトル・本文・タグ横断検索

### AIチャット（右サイドバー）
- ノートについて自然言語で質問できる
- クイック質問プリセット（要点・アクション抽出・要約・改善提案）
- 折りたたみボタンで非表示にできる

## OpenAI APIへの接続方法

### 1. 環境変数を設定

`.env.local` を編集：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. `lib/ai.ts` の関数を置き換え

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function organizeNote(content: string): Promise<AiOrganizeResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `ノートの本文を分析して、以下をJSON形式で返してください：
{"title": "30文字以内のタイトル", "summary": "1行の要約", "tags": ["タグ1", "タグ2", "タグ3"]}`,
      },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content ?? "{}");
}

export async function chatWithNote(
  noteContent: string,
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `以下のノートの内容についてアシスタントとして答えてください：\n\n${noteContent}`,
      },
      ...history,
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0].message.content ?? "エラーが発生しました。";
}
```

### 3. OpenAI パッケージを追加

```bash
npm install openai
```

## プロジェクト構造

```
note-app/
├── app/
│   ├── globals.css       # グローバルスタイル
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # メインページ
├── components/
│   ├── Sidebar.tsx       # 左サイドバー（ノート一覧・タグ・検索）
│   ├── Editor.tsx        # メインエディタ（Markdownプレビュー対応）
│   └── AiSidebar.tsx     # 右サイドバー（AIチャット）
├── lib/
│   ├── ai.ts             # AIモック関数（API差し替え用）
│   └── store.ts          # Zustand状態管理
├── types/
│   └── index.ts          # TypeScript型定義
├── tailwind.config.ts    # Tailwind設定（カラーパレット）
├── tsconfig.json
└── package.json
```

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 14 (App Router) | フレームワーク |
| TypeScript | 型安全 |
| Tailwind CSS | スタイリング |
| Zustand + persist | 状態管理・localStorage保存 |
| react-markdown + remark-gfm | Markdownレンダリング |
| Lucide React | アイコン |
| uuid | ノートID生成 |
