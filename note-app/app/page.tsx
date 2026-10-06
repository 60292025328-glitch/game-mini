"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// SSR無効化（Zustand の localStorage persist のため）
const Sidebar = dynamic(() => import("@/components/Sidebar"), {
  ssr: false,
  loading: () => (
    <div className="w-64 bg-dark-surface border-r border-dark-border shrink-0 flex items-center justify-center">
      <Loader2 size={16} className="text-text-muted animate-spin" />
    </div>
  ),
});

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-dark-bg">
      <Loader2 size={16} className="text-text-muted animate-spin" />
    </div>
  ),
});

const AiSidebar = dynamic(() => import("@/components/AiSidebar"), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-dark-bg">
      {/* 左サイドバー：ノート一覧・タグフィルター */}
      <Sidebar />

      {/* メインエリア：エディタ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Editor />
      </div>

      {/* 右サイドバー：AIチャット（折りたたみ可） */}
      <AiSidebar />
    </main>
  );
}
