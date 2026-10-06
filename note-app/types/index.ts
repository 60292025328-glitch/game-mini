// ノートアプリの型定義

export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isAiProcessed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AiOrganizeResult {
  title: string;
  summary: string;
  tags: string[];
}

export interface NoteStore {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  isRightSidebarOpen: boolean;

  // アクション
  addNote: () => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  toggleRightSidebar: () => void;

  // 派生データ
  getFilteredNotes: () => Note[];
  getAllTags: () => string[];
  getSelectedNote: () => Note | null;
}

export interface ChatStore {
  messages: Record<string, ChatMessage[]>; // noteId -> messages
  isLoading: boolean;
  addMessage: (noteId: string, message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  getMessages: (noteId: string) => ChatMessage[];
  clearMessages: (noteId: string) => void;
}
