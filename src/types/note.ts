export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface NoteImage {
  id: string;
  url: string;
  name: string;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
}

export interface NoteMetadata {
  showDateOnCard: boolean;
  reminderAt: string | null;
}

export interface Note {
  id: string;
  title: string;
  type: "note" | "checklist";
  content: string;
  items: ChecklistItem[];
  images: NoteImage[];
  codeBlocks: CodeBlock[];
  color: string;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  metadata: NoteMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  version: number;
  notes: Note[];
}

export type FilterType =
  | "all"
  | "active"
  | "completed"
  | "pinned"
  | "archived"
  | "trash";
export type SortType = "newest" | "oldest" | "custom";
