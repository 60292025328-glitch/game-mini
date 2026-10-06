"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Loader2,
  Trash2,
  ChevronRight,
  Sparkles,
  User,
  Tag,
  AlignLeft,
  Zap,
} from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { useChatStore } from "@/lib/store";
import { chatWithNote } from "@/lib/ai";
import { v4 as uuidv4 } from "uuid";

// クイック質問のプリセット
const QUICK_PROMPTS = [
  { icon: Zap, label: "要点を3つ教えて", prompt: "このメモの要点を3つ教えてください。" },
  { icon: Tag, label: "アクションアイテム", prompt: "このメモからアクションアイテムを抽出してください。" },
  { icon: AlignLeft, label: "1行で要約", prompt: "このメモを1行で要約してください。" },
  { icon: Sparkles, label: "改善提案", prompt: "このメモをより良くするための改善提案をしてください。" },
];

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AiSidebar() {
  const { isRightSidebarOpen, toggleRightSidebar, getSelectedNote } =
    useNoteStore();
  const { addMessage, setLoading, getMessages, isLoading, clearMessages } =
    useChatStore();

  const note = getSelectedNote();
  const messages = note ? getMessages(note.id) : [];

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 新しいメッセージが追加されたら一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? inputValue).trim();
    if (!text || !note || isLoading) return;

    setInputValue("");

    // ユーザーメッセージを追加
    addMessage(note.id, {
      id: uuidv4(),
      role: "user",
      content: text,
      timestamp: new Date(),
    });

    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatWithNote(note.content, text, history);

      addMessage(note.id, {
        id: uuidv4(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 折りたたみ時は細いタブを表示
  if (!isRightSidebarOpen) {
    return (
      <div className="flex flex-col items-center py-4 w-10 bg-dark-surface border-l border-dark-border shrink-0">
        <button
          onClick={toggleRightSidebar}
          className="flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors p-1"
          title="AIパネルを開く"
        >
          <ChevronRight size={16} />
          <Bot size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside className="flex flex-col w-80 bg-dark-surface border-l border-dark-border shrink-0 animate-slide-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Bot size={13} className="text-accent" />
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary">
              AIアシスタント
            </span>
            <p className="text-[10px] text-text-muted leading-none mt-0.5">
              ノートについて質問できます
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && note && (
            <button
              onClick={() => clearMessages(note.id)}
              className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="会話をクリア"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={toggleRightSidebar}
            className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-dark-hover transition-colors"
            title="パネルを閉じる"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ノートが選択されていない場合 */}
      {!note ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-center">
            <Bot size={20} className="text-text-muted opacity-40" />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">
              ノートを選択してください
            </p>
            <p className="text-xs text-text-muted mt-1">
              ノートを選択するとAIに質問できます
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-3">
                {/* ウェルカムメッセージ */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-accent" />
                  </div>
                  <div className="bg-dark-elevated border border-dark-border rounded-xl rounded-tl-sm px-3 py-2.5 text-xs text-text-secondary leading-relaxed">
                    「{note.title}」についてお気軽に質問してください。
                    要約・アクション抽出・改善提案など、何でも対応します。
                  </div>
                </div>

                {/* クイック質問ボタン */}
                <div className="pl-8">
                  <p className="text-[10px] text-text-muted mb-2 uppercase tracking-wider">
                    クイック質問
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                      <button
                        key={label}
                        onClick={() => handleSend(prompt)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-xs text-text-secondary hover:text-text-primary hover:border-accent/30 hover:bg-accent/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon size={11} className="text-accent shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 animate-fade-in ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* アバター */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        msg.role === "user"
                          ? "bg-dark-elevated border border-dark-border"
                          : "bg-accent/20 border border-accent/30"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={11} className="text-text-muted" />
                      ) : (
                        <Bot size={11} className="text-accent" />
                      )}
                    </div>

                    {/* バブル */}
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-accent/20 border border-accent/25 text-text-primary rounded-tr-sm"
                          : "bg-dark-elevated border border-dark-border text-text-secondary rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                      <div
                        className={`text-[10px] mt-1 ${
                          msg.role === "user"
                            ? "text-accent/50 text-right"
                            : "text-text-muted"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* ローディングインジケーター */}
                {isLoading && (
                  <div className="flex gap-2 animate-fade-in">
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={11} className="text-accent" />
                    </div>
                    <div className="bg-dark-elevated border border-dark-border rounded-xl rounded-tl-sm px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Loader2 size={11} className="text-accent animate-spin" />
                        <span className="text-xs text-text-muted">
                          考え中...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* クイック質問（会話中も表示） */}
          {messages.length > 0 && (
            <div className="px-3 pb-2 border-t border-dark-border pt-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-dark-elevated border border-dark-border text-[11px] text-text-muted hover:text-text-secondary hover:border-accent/30 transition-all shrink-0 disabled:opacity-50"
                  >
                    <Icon size={10} className="text-accent" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 入力エリア */}
          <div className="p-3 border-t border-dark-border">
            <div className="flex items-end gap-2 bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 focus-within:border-accent/40 transition-colors">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="質問を入力... (Enter で送信)"
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none resize-none leading-relaxed max-h-24 overflow-y-auto disabled:opacity-50"
                style={{ minHeight: "20px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="p-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 text-center">
              Shift+Enter で改行
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
