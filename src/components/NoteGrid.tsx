import { Note } from '@/types/note';
import NoteCard from './NoteCard';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { FileText } from 'lucide-react';

interface NoteGridProps {
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onNoteClick: (note: Note) => void;
}

const NoteGrid = ({ notes, onUpdate, onTrash, onRestore, onPurge, onReorder, onNoteClick }: NoteGridProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = notes.map(n => n.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const newIds = [...ids];
    newIds.splice(oldIdx, 1);
    newIds.splice(newIdx, 0, active.id as string);
    onReorder(newIds);
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
        <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Capture anything.</h2>
        <p className="text-muted-foreground text-base">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-medium">N</kbd> to create your first note</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={notes.map(n => n.id)} strategy={rectSortingStrategy}>
        <div
          className="grid gap-4 animate-fade-in"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
        >
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={onUpdate}
              onTrash={onTrash}
              onRestore={onRestore}
              onPurge={onPurge}
              onClick={onNoteClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default NoteGrid;
