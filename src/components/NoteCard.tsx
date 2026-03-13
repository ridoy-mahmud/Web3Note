import { Note } from "@/types/note";
import { motion } from "framer-motion";
import {
  Pin,
  Archive,
  Trash2,
  RotateCcw,
  Clock,
  Copy,
  Download,
} from "lucide-react";
import { formatNoteDate } from "@/lib/date";
import ChecklistEditor from "./ChecklistEditor";
import ImageAttachments from "./ImageAttachments";
import CodeBlockDisplay from "./CodeBlockDisplay";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClick: (note: Note) => void;
}

const NoteCard = ({
  note,
  onUpdate,
  onTrash,
  onRestore,
  onPurge,
  onDuplicate,
  onClick,
}: NoteCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const completedCount = note.items.filter((i) => i.checked).length;
  const totalCount = note.items.length;
  const [pendingAction, setPendingAction] = useState<"trash" | "purge" | null>(
    null,
  );

  const exportAsMarkdown = () => {
    const checklistBody = note.items
      .map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`)
      .join("\n");
    const codeBody = note.codeBlocks
      .map((block) => `\n\n\`\`\`${block.language}\n${block.code}\n\`\`\``)
      .join("");
    const body = note.type === "checklist" ? checklistBody : note.content;
    const markdown = `# ${note.title || "Untitled Note"}\n\n${body}${codeBody}`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(note.title || "note").replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...style, borderTop: `2px solid ${note.color || "#0f172a"}` }}
      {...attributes}
      {...listeners}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="glass-panel rounded-xl p-5 cursor-pointer group hover:border-foreground/20 transition-all duration-200"
      onClick={() => onClick(note)}
      role="article"
      aria-label={`Note: ${note.title || "Untitled"}`}
    >
      {note.pinned && (
        <Pin
          className="w-4 h-4 text-primary mb-2 rotate-45"
          aria-label="Pinned"
        />
      )}

      {note.title && (
        <h3 className="font-bold text-foreground text-base mb-2 tracking-tight">
          {note.title}
        </h3>
      )}

      {note.type === "note" && note.content && (
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 mb-3">
          {note.content}
        </p>
      )}

      {note.type === "checklist" && note.items.length > 0 && (
        <div className="mb-3">
          <ChecklistEditor
            items={note.items.slice(0, 5)}
            onChange={(items) => {
              const allItems = [...items, ...note.items.slice(5)];
              onUpdate(note.id, { items: allItems });
            }}
            readonly
          />
          {note.items.length > 5 && (
            <p className="text-xs text-muted-foreground mt-1">
              +{note.items.length - 5} more
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      )}

      {/* Image attachments preview */}
      {note.images && note.images.length > 0 && (
        <div className="mb-3">
          <ImageAttachments
            images={note.images.slice(0, 4)}
            onChange={() => {}}
            readonly
            compact
          />
        </div>
      )}

      {/* Code blocks preview */}
      {note.codeBlocks && note.codeBlocks.length > 0 && (
        <div className="mb-3 space-y-2">
          {note.codeBlocks.slice(0, 1).map((block) => (
            <CodeBlockDisplay key={block.id} block={block} compact />
          ))}
          {note.codeBlocks.length > 1 && (
            <p className="text-[11px] text-muted-foreground">
              +{note.codeBlocks.length - 1} more code blocks
            </p>
          )}
        </div>
      )}

      {note.metadata.showDateOnCard && note.metadata.reminderAt && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <Clock className="w-3 h-3" />
          {formatNoteDate(note.metadata.reminderAt)}
        </div>
      )}

      <div
        className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 pt-2 border-t border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {!note.trashed ? (
          <>
            <button
              onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={note.pinned ? "Unpin" : "Pin"}
            >
              <Pin className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdate(note.id, { archived: !note.archived })}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={note.archived ? "Unarchive" : "Archive"}
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(note.id)}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Duplicate note"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={exportAsMarkdown}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Export note"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPendingAction("trash")}
              className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors ml-auto"
              aria-label="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onRestore(note.id)}
              className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              aria-label="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPendingAction("purge")}
              className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors ml-auto"
              aria-label="Delete permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <DeleteConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction === "purge"
            ? "Delete note permanently?"
            : "Move note to trash?"
        }
        description={
          pendingAction === "purge"
            ? "This note will be removed forever. This action cannot be undone."
            : "You can still restore this note from the Trash view."
        }
        confirmLabel={
          pendingAction === "purge" ? "Delete Forever" : "Move to Trash"
        }
        onConfirm={() => {
          if (pendingAction === "purge") {
            onPurge(note.id);
          } else {
            onTrash(note.id);
          }
          setPendingAction(null);
        }}
      />
    </motion.div>
  );
};

export default NoteCard;
