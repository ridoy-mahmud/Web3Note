import { useState, useEffect, lazy, Suspense } from "react";
import Header from "@/components/Header";
import FiltersBar from "@/components/FiltersBar";
import QuickCreate from "@/components/QuickCreate";
import NoteGrid from "@/components/NoteGrid";
import Modal from "@/components/Modal";
import { useAppState } from "@/hooks/useAppState";
import { Note } from "@/types/note";

const ThreeScene = lazy(() => import("@/components/ThreeScene"));

const Index = () => {
  const {
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
    restore,
    reorder,
    duplicate,
  } = useAppState();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
        <NoteGrid
          notes={filteredNotes}
          onUpdate={update}
          onTrash={trash}
          onRestore={restore}
          onPurge={purge}
          onDuplicate={duplicate}
          onReorder={reorder}
          onNoteClick={setEditingNote}
        />
      </main>

      <Modal
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onUpdate={update}
        onTrash={trash}
      />
    </div>
  );
};

export default Index;
