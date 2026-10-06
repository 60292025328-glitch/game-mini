"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Note, ChatMessage, NoteStore, ChatStore } from "@/types";

// ---- サンプルノート（初回起動時のデモ用） ----
const SAMPLE_NOTES: Note[] = [
  {
    id: uuidv4(),
    title: "プロジェクトのアイデア整理",
    content: `# プロジェクトのアイデア整理

## やりたいこと
- AIを使ったノートアプリを作る
- MarkdownエディタにAIアシスタントを組み込む
- タグの自動生成機能を実装する

## 技術スタック候補
- **フロントエンド**: Next.js + Tailwind CSS
- **AI**: OpenAI GPT-4o
- **状態管理**: Zustand

## 懸念点
1. APIのコストが高くなりそう
2. リアルタイム同期をどう実装するか
3. オフライン対応が必要か？

## 次のアクション
- [ ] 競合調査（Notion AI, Obsidian Copilot）
- [ ] プロトタイプを1週間で作る
- [ ] 友人に見せてフィードバックを得る
`,
    summary: "AIノートアプリのアイデアと技術スタックを整理したメモ。実装の懸念点と次のアクションが明確化されている。",
    tags: ["プロジェクト", "AI", "開発", "アイデア"],
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    isAiProcessed: true,
  },
  {
    id: uuidv4(),
    title: "今週の振り返り",
    content: `# 今週の振り返り

よかったこと：
- 毎朝30分の読書を続けられた
- コードレビューで良いフィードバックをもらった
- 新しいカフェを発見した、集中できる場所

改善したいこと：
- 夜遅くスマホを見てしまう → 23時以降は机に置く
- ミーティングの準備が足りなかった
- 運動できなかった週が続いている

来週のテーマ: **「一つに絞る」**
- 最重要タスクを毎朝一つだけ決める
- SNSを1日1回に制限する
`,
    summary: "今週の良かった点と改善点を整理。来週は「一つに絞る」をテーマに集中力を高める。",
    tags: ["振り返り", "習慣", "生産性"],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    isAiProcessed: true,
  },
  {
    id: uuidv4(),
    title: "読書メモ: ゼロ・トゥ・ワン",
    content: `# ゼロ・トゥ・ワン - ピーター・ティール

## 核心メッセージ
「1から100」ではなく「0から1」を目指す。
真のイノベーションは競争を避け、独占を目指すことから生まれる。

## 印象的なフレーズ
> 「競争はあなたから利益を奪い、あなたを誰とも区別できない存在にする」

## 学んだこと
1. 独占こそが持続的なビジネスの鍵
2. 小さな市場で圧倒的No.1になってから拡張する
3. 秘密（誰も言っていないが本当のこと）を見つける

## 自分への問い
- 自分が信じているが、他のほとんどの人が反対していることは何か？
- どの市場で独占できるか？

## 次に読む本
- ハードシングス（ベン・ホロウィッツ）
`,
    summary: "ゼロ・トゥ・ワンの読書メモ。競争を避けて独占を目指すという核心メッセージとその実践的示唆をまとめた。",
    tags: ["読書", "ビジネス", "戦略", "起業"],
    createdAt: new Date(Date.now() - 3600000 * 3),
    updatedAt: new Date(Date.now() - 3600000 * 3),
    isAiProcessed: true,
  },
];

// ---- ノートストア ----
export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: SAMPLE_NOTES,
      selectedNoteId: SAMPLE_NOTES[0].id,
      searchQuery: "",
      selectedTag: null,
      isRightSidebarOpen: true,

      addNote: () => {
        const newNote: Note = {
          id: uuidv4(),
          title: "新規ノート",
          content: "",
          summary: "",
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isAiProcessed: false,
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          selectedNoteId: newNote.id,
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        const { notes, selectedNoteId } = get();
        const remaining = notes.filter((n) => n.id !== id);
        const newSelected =
          selectedNoteId === id
            ? remaining.length > 0
              ? remaining[0].id
              : null
            : selectedNoteId;

        set({ notes: remaining, selectedNoteId: newSelected });
      },

      selectNote: (id) => set({ selectedNoteId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedTag: (tag) => set({ selectedTag: tag }),

      toggleRightSidebar: () =>
        set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

      getFilteredNotes: () => {
        const { notes, searchQuery, selectedTag } = get();
        return notes.filter((note) => {
          const matchesSearch =
            searchQuery === "" ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            );

          const matchesTag =
            selectedTag === null || note.tags.includes(selectedTag);

          return matchesSearch && matchesTag;
        });
      },

      getAllTags: () => {
        const { notes } = get();
        const tagSet = new Set<string>();
        notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
        return Array.from(tagSet).sort();
      },

      getSelectedNote: () => {
        const { notes, selectedNoteId } = get();
        return notes.find((n) => n.id === selectedNoteId) ?? null;
      },
    }),
    {
      name: "note-store",
      // Date オブジェクトのシリアライズ対応
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Date の復元
          if (parsed.state?.notes) {
            parsed.state.notes = parsed.state.notes.map((note: Note) => ({
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt),
            }));
          }
          return parsed;
        },
        setItem: (name, value) =>
          localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// ---- チャットストア ----
export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: {},
  isLoading: false,

  addMessage: (noteId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [noteId]: [...(state.messages[noteId] ?? []), message],
      },
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  getMessages: (noteId) => get().messages[noteId] ?? [],

  clearMessages: (noteId) => {
    set((state) => {
      const next = { ...state.messages };
      delete next[noteId];
      return { messages: next };
    });
  },
}));
