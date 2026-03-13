import { useState, useEffect, lazy, Suspense } from "react";
import Header from "@/components/Header";
import FiltersBar from "@/components/FiltersBar";
import QuickCreate from "@/components/QuickCreate";
import NoteGrid from "@/components/NoteGrid";
import Modal from "@/components/Modal";
import { useAppState } from "@/hooks/useAppState";
import { Note } from "@/types/note";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

const ThreeScene = lazy(() => import("@/components/ThreeScene"));

const Index = () => {
  const {
    state,
    filteredNotes,
    filter,
    sort,
    search,
    setFilter,
    setSort,
    setSearch,
    add,
    update,
    trash,
    purge,
    purgeMany,
    restore,
    reorder,
    duplicate,
  } = useAppState();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedTrashIds, setSelectedTrashIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [suppressOpenUntil, setSuppressOpenUntil] = useState(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (filter !== "trash" && selectedTrashIds.length > 0) {
      setSelectedTrashIds([]);
    }
  }, [filter, selectedTrashIds.length]);

  const safeTrash = (id: string) => {
    setSuppressOpenUntil(Date.now() + 250);
    setSelectedTrashIds((prev) => prev.filter((x) => x !== id));
    trash(id);
  };

  const safePurge = (id: string) => {
    setSuppressOpenUntil(Date.now() + 250);
    setSelectedTrashIds((prev) => prev.filter((x) => x !== id));
    purge(id);
  };

  const toggleTrashSelection = (id: string) => {
    setSelectedTrashIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllTrashVisible = () => {
    setSelectedTrashIds(filteredNotes.map((n) => n.id));
  };

  const clearTrashSelection = () => {
    setSelectedTrashIds([]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        // Focus the quick create
        const btn = document.querySelector(
          '[aria-label="Create new note"]',
        ) as HTMLButtonElement;
        btn?.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!editingNote) return;

    const current = state.notes.find((n) => n.id === editingNote.id);
    if (!current || current.trashed) {
      setEditingNote(null);
    }
  }, [editingNote, state.notes]);

  return (
    <div className="min-h-screen bg-background relative">
      {!reducedMotion && (
        <Suspense fallback={null}>
          <ThreeScene />
        </Suspense>
      )}

      <Header search={search} onSearchChange={setSearch} />
      <FiltersBar
        filter={filter}
        sort={sort}
        notesCount={filteredNotes.length}
        onFilterChange={setFilter}
        onSortChange={setSort}
      />

      <main className="w-[95%] lg:w-[80%] px-4 sm:px-6 lg:px-8 py-8 mx-auto">
        <QuickCreate onAdd={add} />

        {filter === "trash" && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background/40 p-3">
            <button
              onClick={selectAllTrashVisible}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Select all
            </button>
            <button
              onClick={clearTrashSelection}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Clear selection
            </button>
            <span className="text-xs text-muted-foreground">
              {selectedTrashIds.length} selected
            </span>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={selectedTrashIds.length === 0}
              className="ml-auto px-3 py-1.5 rounded-md text-xs font-semibold bg-destructive/15 text-destructive hover:bg-destructive/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Delete selected permanently
            </button>
          </div>
        )}

        <NoteGrid
          notes={filteredNotes}
          onUpdate={update}
          onTrash={safeTrash}
          onRestore={restore}
          onPurge={safePurge}
          onDuplicate={duplicate}
          onReorder={reorder}
          onNoteClick={(note) => {
            if (Date.now() < suppressOpenUntil) return;
            setEditingNote(note);
          }}
          selectable={filter === "trash"}
          selectedIds={selectedTrashIds}
          onToggleSelect={toggleTrashSelection}
        />
      </main>

      <Modal
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onUpdate={update}
        onTrash={safeTrash}
      />

      <DeleteConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected notes forever?"
        description="Selected notes in Trash will be permanently deleted and cannot be restored."
        confirmLabel="Delete Selected"
        onConfirm={() => {
          setSuppressOpenUntil(Date.now() + 250);
          purgeMany(selectedTrashIds);
          setSelectedTrashIds([]);
          setBulkDeleteOpen(false);
        }}
      />
    </div>
  );
};

export default Index;
