import {
  AppState,
  Note,
  ChecklistItem,
  NoteImage,
  CodeBlock,
} from "@/types/note";

const CURRENT_VERSION = 2;
const DEFAULT_DEV_NOTES_API_BASE_URL = "http://localhost:8787";
const LOCAL_CACHE_PREFIX = "web3noteapp.state.local";
const SESSION_CACHE_PREFIX = "web3noteapp.state.session";

function generateId(): string {
  return (
    crypto.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

function defaultState(): AppState {
  return { version: CURRENT_VERSION, notes: [] };
}

function localCacheKey(ownerId: string): string {
  return `${LOCAL_CACHE_PREFIX}.${ownerId}`;
}

function sessionCacheKey(ownerId: string): string {
  return `${SESSION_CACHE_PREFIX}.${ownerId}`;
}

function readCachedStateByKey(key: string): AppState | null {
  try {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return null;
    return migrateIfNeeded(JSON.parse(raw) as AppState);
  } catch {
    return null;
  }
}

export function getCachedState(ownerId: string): AppState | null {
  const fromSession = readCachedStateByKey(sessionCacheKey(ownerId));
  if (fromSession) return fromSession;
  return readCachedStateByKey(localCacheKey(ownerId));
}

export function cacheState(ownerId: string, state: AppState): void {
  const data = JSON.stringify(migrateIfNeeded(state));
  localStorage.setItem(localCacheKey(ownerId), data);
  sessionStorage.setItem(sessionCacheKey(ownerId), data);
}

function getNotesApiBaseUrl(): string {
  const envBaseUrl = import.meta.env.VITE_NOTES_API_BASE_URL;
  if (envBaseUrl && envBaseUrl.trim().length > 0) {
    return envBaseUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    if (isLocalHost) {
      return DEFAULT_DEV_NOTES_API_BASE_URL;
    }
  }

  return "";
}

function notesApiUrl(path: string): string {
  const apiBaseUrl = getNotesApiBaseUrl().replace(/\/$/, "");
  if (!apiBaseUrl) {
    return path;
  }
  return `${apiBaseUrl}${path}`;
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
  const response = await fetch(
    notesApiUrl(`/api/state/${encodeURIComponent(ownerId)}`),
  );

  if (response.status === 404) {
    const fallback = defaultState();
    cacheState(ownerId, fallback);
    return fallback;
  }

  if (!response.ok) {
    throw new Error(`Failed to load state (${response.status})`);
  }

  const data = (await response.json()) as { state?: AppState };
  if (!data.state) {
    const fallback = defaultState();
    cacheState(ownerId, fallback);
    return fallback;
  }

  const migrated = migrateIfNeeded(data.state);
  cacheState(ownerId, migrated);
  return migrated;
}

export async function saveState(
  ownerId: string,
  state: AppState,
): Promise<void> {
  cacheState(ownerId, state);
  const response = await fetch(
    notesApiUrl(`/api/state/${encodeURIComponent(ownerId)}`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to save state (${response.status})`);
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

export function createChecklistItem(text: string): ChecklistItem {
  return { id: generateId(), text, checked: false };
}
