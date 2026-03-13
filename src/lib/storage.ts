import {
  AppState,
  Note,
  ChecklistItem,
  NoteImage,
  CodeBlock,
} from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const CURRENT_VERSION = 2;

function generateId(): string {
  return (
    crypto.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

function defaultState(): AppState {
  return { version: CURRENT_VERSION, notes: [] };
}

export function initStorage(): AppState {
  return defaultState();
}

export function migrateIfNeeded(state: AppState): AppState {
  const s = { ...state };
  if (!s.version || s.version < 2) {
    s.notes = s.notes.map((n) => ({
      ...n,
      images: (n as Note & { images?: NoteImage[] }).images || [],
      codeBlocks: (n as Note & { codeBlocks?: CodeBlock[] }).codeBlocks || [],
    }));
    s.version = 2;
  }
  return s;
}

export function getState(): AppState {
  return defaultState();
}

export async function loadState(ownerId: string): Promise<AppState> {
  const { data, error } = await supabase
    .from("user_states")
    .select("state")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load state (${error.message})`);
  }

  if (!data?.state || typeof data.state !== "object") {
    return defaultState();
  }

  return migrateIfNeeded(data.state as unknown as AppState);
}

export async function saveState(
  ownerId: string,
  state: AppState,
): Promise<void> {
  const nextState = migrateIfNeeded(state);
  const { error } = await supabase.from("user_states").upsert(
    {
      owner_id: ownerId,
      state: nextState as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" },
  );

  if (error) {
    throw new Error(`Failed to save state (${error.message})`);
  }
}

export function addNote(state: AppState, partial: Partial<Note>): AppState {
  const now = new Date().toISOString();
  const note: Note = {
    id: generateId(),
    title: partial.title || "",
    type: partial.type || "note",
    content: partial.content || "",
    items: partial.items || [],
    images: partial.images || [],
    codeBlocks: partial.codeBlocks || [],
    color: partial.color || "#0f172a",
    pinned: partial.pinned || false,
    archived: false,
    trashed: false,
    metadata: partial.metadata || { showDateOnCard: false, reminderAt: null },
    createdAt: now,
    updatedAt: now,
  };
  const newState = { ...state, notes: [note, ...state.notes] };
  return newState;
}

export function updateNote(
  state: AppState,
  id: string,
  updates: Partial<Note>,
): AppState {
  const newState = {
    ...state,
    notes: state.notes.map((n) =>
      n.id === id
        ? { ...n, ...updates, updatedAt: new Date().toISOString() }
        : n,
    ),
  };
  return newState;
}

export function deleteNote(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    notes: state.notes.map((n) =>
      n.id === id
        ? { ...n, trashed: true, updatedAt: new Date().toISOString() }
        : n,
    ),
  };
  return newState;
}

export function purgeNote(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    notes: state.notes.filter((n) => n.id !== id),
  };
  return newState;
}

export function reorderNotes(state: AppState, noteIds: string[]): AppState {
  const noteMap = new Map(state.notes.map((n) => [n.id, n]));
  const ordered = noteIds
    .map((id) => noteMap.get(id))
    .filter(Boolean) as Note[];
  const remaining = state.notes.filter((n) => !noteIds.includes(n.id));
  const newState = { ...state, notes: [...ordered, ...remaining] };
  return newState;
}

export function duplicateNote(state: AppState, id: string): AppState {
  const source = state.notes.find((n) => n.id === id);
  if (!source) return state;

  const now = new Date().toISOString();
  const duplicate: Note = {
    ...source,
    id: generateId(),
    title: source.title ? `${source.title} (Copy)` : "Untitled (Copy)",
    pinned: false,
    archived: false,
    trashed: false,
    createdAt: now,
    updatedAt: now,
  };

  return { ...state, notes: [duplicate, ...state.notes] };
}

export function createChecklistItem(text: string): ChecklistItem {
  return { id: generateId(), text, checked: false };
}
