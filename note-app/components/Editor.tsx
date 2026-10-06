"use client";

import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Eye,
  Edit3,
  Sparkles,
  Loader2,
  Tag,
  AlignLeft,
  Trash2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { organizeNote } from "@/lib/ai";

type ViewMode = "edit" | "preview" | "split";

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Editor() {
  const { getSelectedNote, updateNote, deleteNote, getAllTags } =
    useNoteStore();

  const note = getSelectedNote();
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [localContent, setLocalContent] = useState(note?.content ?? "");

  // ノートが切り替わったらローカルの内容も同期
  useEffect(() => {
    setLocalContent(note?.content ?? "");
    setAiSuccess(false);
  }, [note?.id]);

  // デバウンスして保存（300ms）
  useEffect(() => {
    if (!note) return;
    const noteId = note.id;
    const timer = setTimeout(() => {
      updateNote(noteId, { content: localContent });
    }, 300);
    return () => clearTimeout(timer);
  }, [localContent, note?.id, updateNote]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!note) return;
      updateNote(note.id, { title: e.target.value });
    },
    [note?.id, updateNote]
  );

  const handleAiOrganize = async () => {
    if (!note || !localContent.trim()) return;
    setIsAiLoading(true);
    setAiSuccess(false);

    try {
      const result = await organizeNote(localContent);
      updateNote(note.id, {
        title: result.title,
        summary: result.summary,
        tags: result.tags,
        isAiProcessed: true,
      });
      setAiSuccess(true);
      setTimeout(() => setAiSuccess(false), 3000);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    if (!note) return;
    updateNote(note.id, {
      tags: note.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const input = e.currentTarget;
    const newTag = input.value.trim();
    if (!newTag || !note || note.tags.includes(newTag)) {
      input.value = "";
      return;
    }
    updateNote(note.id, { tags: [...note.tags, newTag] });
    input.value = "";
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-text-muted bg-dark-bg">
        <div className="w-16 h-16 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center">
          <Edit3 size={28} className="text-text-muted opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary">
            ノートが選択されていません
          </p>
          <p className="text-xs text-text-muted mt-1">
            左のサイドバーからノートを選択するか、新規作成してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-dark-bg">
      {/* ツールバー */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dark-border bg-dark-surface shrink-0">
        {/* 表示モード切り替え */}
        <div className="flex items-center gap-1 bg-dark-elevated rounded-lg p-0.5 border border-dark-border">
          {(
            [
              { mode: "edit" as ViewMode, icon: Edit3, label: "編集" },
              { mode: "split" as ViewMode, icon: AlignLeft, label: "分割" },
              { mode: "preview" as ViewMode, icon: Eye, label: "プレビュー" },
            ] as const
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-dark-surface text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* 右側アクション */}
        <div className="flex items-center gap-2">
          {/* 最終更新時刻 */}
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Clock size={11} />
            {formatDateTime(note.updatedAt)}
          </div>

          {/* AIで整理ボタン */}
          <button
            onClick={handleAiOrganize}
            disabled={isAiLoading || !localContent.trim()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              aiSuccess
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : isAiLoading
                ? "bg-accent/20 text-accent/60 border border-accent/20 cursor-wait"
                : "bg-accent/15 text-accent hover:bg-accent/25 border border-accent/25 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {isAiLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : aiSuccess ? (
              <CheckCircle2 size={12} />
            ) : (
              <Sparkles size={12} />
            )}
            {isAiLoading
              ? "整理中..."
              : aiSuccess
              ? "完了!"
              : "AIで整理"}
          </button>

          {/* 削除ボタン */}
          <button
            onClick={() => {
              if (confirm("このノートを削除しますか？")) {
                deleteNote(note.id);
              }
            }}
            className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* メタ情報エリア（タイトル・要約・タグ） */}
      <div className="px-6 pt-4 pb-3 border-b border-dark-border bg-dark-surface shrink-0">
        {/* タイトル */}
        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="タイトルを入力..."
          className="w-full text-xl font-bold text-text-primary bg-transparent border-none outline-none placeholder:text-text-muted mb-2"
        />

        {/* 要約 */}
        {note.summary && (
          <p className="text-sm text-text-secondary mb-2 leading-relaxed border-l-2 border-accent/40 pl-3">
            {note.summary}
          </p>
        )}

        {/* タグ */}
        <div className="flex items-center gap-2 flex-wrap">
          <Tag size={12} className="text-text-muted shrink-0" />
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="group flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 cursor-default"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="タグを追加..."
            onKeyDown={handleAddTag}
            list="tag-suggestions"
            className="text-xs text-text-secondary bg-transparent border-none outline-none placeholder:text-text-muted w-24"
          />
          <datalist id="tag-suggestions">
            {getAllTags().map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
      </div>

      {/* エディタ本体 */}
      <div className="flex-1 min-h-0 flex">
        {/* 編集エリア */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={`flex flex-col min-h-0 ${
              viewMode === "split" ? "w-1/2 border-r border-dark-border" : "w-full"
            }`}
          >
            <textarea
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              placeholder={`# タイトル\n\nここに自由に書き殴ってください...\n\nMarkdown記法が使えます。AIが自動で整理してくれます。`}
              className="flex-1 w-full px-6 py-4 bg-dark-bg text-text-primary text-sm leading-relaxed resize-none outline-none font-mono placeholder:text-text-muted/40 selection:bg-accent/30"
              spellCheck={false}
            />
          </div>
        )}

        {/* プレビューエリア */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`overflow-y-auto min-h-0 ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            {localContent.trim() ? (
              <div className="px-6 py-4 prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-text-primary mb-3 mt-0 pb-2 border-b border-dark-border">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold text-text-primary mb-2 mt-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-text-secondary mb-1.5 mt-3">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-text-secondary text-sm leading-relaxed mb-3">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 mb-3 text-text-secondary text-sm">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 mb-3 text-text-secondary text-sm">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-text-secondary text-sm leading-relaxed">
                        {children}
                      </li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-accent/50 pl-4 my-3 text-text-muted italic text-sm">
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children, ...props }) => {
                      const isBlock = className?.includes("language-");
                      return isBlock ? (
                        <code
                          className={`block bg-dark-elevated border border-dark-border rounded-lg px-4 py-3 text-xs font-mono text-text-secondary overflow-x-auto mb-3 ${className}`}
                        >
                          {children}
                        </code>
                      ) : (
                        <code className="bg-dark-elevated px-1.5 py-0.5 rounded text-xs font-mono text-accent">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="bg-transparent m-0 p-0">{children}</pre>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-hover underline underline-offset-2 text-sm"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-text-primary">
                        {children}
                      </strong>
                    ),
                    hr: () => (
                      <hr className="border-dark-border my-4" />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-3">
                        <table className="w-full text-sm border-collapse border border-dark-border">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary bg-dark-elevated border border-dark-border">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-xs text-text-muted border border-dark-border">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {localContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                <p className="text-sm">プレビューするコンテンツがありません</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
