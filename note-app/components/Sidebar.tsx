"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Tag,
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  StickyNote,
  X,
} from "lucide-react";
import { useNoteStore } from "@/lib/store";
import type { Note } from "@/types";

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return `${days}日前`;
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function NoteItem({ note, isSelected, onSelect, onDelete }: NoteItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`group relative flex flex-col gap-1 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
        isSelected
          ? "bg-accent/20 border border-accent/30"
          : "hover:bg-dark-hover border border-transparent"
      }`}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* タイトル行 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText
            size={13}
            className={`shrink-0 mt-0.5 ${
              isSelected ? "text-accent" : "text-text-muted"
            }`}
          />
          <span
            className={`text-sm font-medium truncate ${
              isSelected ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {note.title || "無題のノート"}
          </span>
        </div>
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="shrink-0 p-0.5 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* 要約 */}
      {note.summary && (
        <p className="text-xs text-text-muted line-clamp-1 pl-5">
          {note.summary}
        </p>
      )}

      {/* タグと日付 */}
      <div className="flex items-center justify-between pl-5">
        <div className="flex gap-1 flex-wrap">
          {note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-dark-elevated text-text-muted border border-dark-border"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-[10px] text-text-muted">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
        <span className="text-[10px] text-text-muted shrink-0">
          {formatDate(note.updatedAt)}
        </span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const {
    selectedNoteId,
    searchQuery,
    selectedTag,
    addNote,
    deleteNote,
    selectNote,
    setSearchQuery,
    setSelectedTag,
    getFilteredNotes,
    getAllTags,
  } = useNoteStore();

  const [isTagsOpen, setIsTagsOpen] = useState(true);

  const filteredNotes = getFilteredNotes();
  const allTags = getAllTags();

  return (
    <aside className="flex flex-col h-full w-64 bg-dark-surface border-r border-dark-border shrink-0">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-accent" />
          <span className="text-sm font-semibold text-text-primary">
            ZatsuNote
          </span>
        </div>
        <button
          onClick={addNote}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
          title="新規ノート作成"
        >
          <Plus size={13} />
          新規
        </button>
      </div>

      {/* 検索バー */}
      <div className="px-3 py-2 border-b border-dark-border">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-7 py-1.5 rounded-md bg-dark-elevated border border-dark-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* タグフィルター */}
        {allTags.length > 0 && (
          <div className="px-3 py-2 border-b border-dark-border">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="flex items-center gap-1.5 w-full text-xs font-medium text-text-muted hover:text-text-secondary transition-colors mb-1.5"
            >
              {isTagsOpen ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <Tag size={11} />
              タグ
            </button>
            {isTagsOpen && (
              <div className="flex flex-wrap gap-1.5 pl-3">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
                  >
                    <X size={9} />
                    全て表示
                  </button>
                )}
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                      selectedTag === tag
                        ? "bg-accent/20 text-accent border-accent/40"
                        : "bg-dark-elevated text-text-muted border-dark-border hover:text-text-secondary hover:border-dark-border/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ノート一覧 */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              ノート
            </span>
            <span className="text-[11px] text-text-muted">
              {filteredNotes.length}件
            </span>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-text-muted">
              <FileText size={24} className="opacity-30" />
              <p className="text-xs text-center">
                {searchQuery || selectedTag
                  ? "一致するノートがありません"
                  : "ノートがありません"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onSelect={() => selectNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="px-4 py-2 border-t border-dark-border">
        <p className="text-[10px] text-text-muted text-center">
          {allTags.length > 0
            ? `${filteredNotes.length} ノート · ${allTags.length} タグ`
            : `${filteredNotes.length} ノート`}
        </p>
      </div>
    </aside>
  );
}
