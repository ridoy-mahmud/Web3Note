import { useState, useCallback, useEffect, useRef } from "react";
import { AppState, Note, FilterType, SortType } from "@/types/note";
import {
  initStorage,
  addNote,
  updateNote,
  deleteNote,
  purgeNote,
  reorderNotes,
  saveState,
  loadState,
  getCachedState,
  cacheState,
} from "@/lib/storage";
import {
  isDueToday,
  isUpcoming,
  scheduleNotification,
  requestNotificationPermission,
} from "@/lib/date";
import { useAuth } from "@/contexts/AuthContext";

export function useAppState() {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(initStorage);
  const [canSyncRemote, setCanSyncRemote] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [search, setSearch] = useState("");
  const timers = useRef<Map<string, number>>(new Map());
  const ownerId = user?.id ?? "anonymous";

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    let mounted = true;
    setCanSyncRemote(false);

    const cached = getCachedState(ownerId);
    if (cached) {
      setState(cached);
    } else {
      setState(initStorage());
    }

    loadState(ownerId)
      .then((remoteState) => {
        if (!mounted) return;
        setState(remoteState);
        setCanSyncRemote(true);
      })
      .catch(() => {
        if (!mounted) return;
        setCanSyncRemote(false);
      });

    return () => {
      mounted = false;
    };
  }, [ownerId]);

  useEffect(() => {
    cacheState(ownerId, state);
    if (!canSyncRemote) return;
    saveState(ownerId, state).catch(() => {
      // Keep UI functional even if remote persistence fails.
    });
  }, [ownerId, state, canSyncRemote]);

  // Schedule notifications for notes with reminders
  useEffect(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    state.notes.forEach((note) => {
      if (note.metadata.reminderAt && !note.trashed && !note.archived) {
        const t = scheduleNotification(
          note.title,
          note.metadata.reminderAt,
          note.id,
        );
        if (t !== null) timers.current.set(note.id, t);
      }
    });
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, [state.notes]);

  const add = useCallback((partial: Partial<Note>) => {
    setState((prev) => addNote(prev, partial));
  }, []);

  const update = useCallback((id: string, updates: Partial<Note>) => {
    setState((prev) => updateNote(prev, id, updates));
  }, []);

  const trash = useCallback((id: string) => {
    setState((prev) => deleteNote(prev, id));
  }, []);

  const purge = useCallback((id: string) => {
    setState((prev) => purgeNote(prev, id));
  }, []);

  const restore = useCallback((id: string) => {
    setState((prev) => updateNote(prev, id, { trashed: false }));
  }, []);

  const reorder = useCallback((ids: string[]) => {
    setState((prev) => reorderNotes(prev, ids));
  }, []);

  const filteredNotes = (() => {
    let notes = state.notes;

    // Search
    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.items.some((i) => i.text.toLowerCase().includes(q)),
      );
    }

    // Filter
    switch (filter) {
      case "active":
        notes = notes.filter((n) => !n.trashed && !n.archived);
        break;
      case "completed":
        notes = notes.filter(
          (n) =>
            !n.trashed &&
            n.type === "checklist" &&
            n.items.length > 0 &&
            n.items.every((i) => i.checked),
        );
        break;
      case "today":
        notes = notes.filter(
          (n) => !n.trashed && isDueToday(n.metadata.reminderAt),
        );
        break;
      case "upcoming":
        notes = notes.filter(
          (n) => !n.trashed && isUpcoming(n.metadata.reminderAt),
        );
        break;
      case "pinned":
        notes = notes.filter((n) => n.pinned && !n.trashed);
        break;
      case "archived":
        notes = notes.filter((n) => n.archived && !n.trashed);
        break;
      case "trash":
        notes = notes.filter((n) => n.trashed);
        break;
      default:
        notes = notes.filter((n) => !n.trashed && !n.archived);
    }

    // Sort
    if (sort === "newest") {
      notes = [...notes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sort === "oldest") {
      notes = [...notes].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    // Pinned first
    const pinned = notes.filter((n) => n.pinned);
    const unpinned = notes.filter((n) => !n.pinned);
    return [...pinned, ...unpinned];
  })();

  return {
    state,
    filter,
    sort,
    search,
    filteredNotes,
    setFilter,
    setSort,
    setSearch,
    add,
    update,
    trash,
    purge,
    restore,
    reorder,
  };
}
