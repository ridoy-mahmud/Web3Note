import { Note, ChecklistItem, CodeBlock } from "@/types/note";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ListChecks,
  Calendar,
  Trash2,
  Code,
  Download,
  CheckCheck,
  Palette,
} from "lucide-react";
import ChecklistEditor from "./ChecklistEditor";
import ImageAttachments from "./ImageAttachments";
import CodeBlockDisplay from "./CodeBlockDisplay";
import { createChecklistItem } from "@/lib/storage";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const NOTE_COLORS = [
  "#0f172a",
  "#334155",
  "#1e3a8a",
  "#065f46",
  "#7c2d12",
  "#7f1d1d",
];

interface ModalProps {
  note: Note | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onTrash: (id: string) => void;
}

const Modal = ({ note, onClose, onUpdate, onTrash }: ModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"note" | "checklist">("note");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [reminderAt, setReminderAt] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [color, setColor] = useState("#0f172a");
  const [pendingDeleteAction, setPendingDeleteAction] = useState<
    "note" | "code"
  >("note");
  const [pendingCodeBlockId, setPendingCodeBlockId] = useState<string | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
      setItems(note.items);
      setImages(note.images || []);
      setCodeBlocks(note.codeBlocks || []);
      setColor(note.color || "#0f172a");
      setReminderAt(
        note.metadata.reminderAt ? note.metadata.reminderAt.slice(0, 16) : "",
      );
    }
  }, [note]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const save = () => {
    if (!note) return;
    onUpdate(note.id, {
      title,
      content: type === "note" ? content : "",
      type,
      items: type === "checklist" ? items : [],
      images,
      codeBlocks,
      color,
      metadata: {
        showDateOnCard: !!reminderAt,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      },
    });
    onClose();
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setItems([...items, createChecklistItem(newItemText.trim())]);
    setNewItemText("");
  };

  const addCodeBlock = () => {
    if (!codeContent.trim()) return;
    setCodeBlocks([
      ...codeBlocks,
      {
        id: crypto.randomUUID(),
        language: codeLanguage,
        code: codeContent.trim(),
      },
    ]);
    setCodeContent("");
    setShowCodeInput(false);
  };

  const removeCodeBlock = (id: string) => {
    setPendingDeleteAction("code");
    setPendingCodeBlockId(id);
    setConfirmOpen(true);
  };

  const clearCompletedItems = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const exportAsMarkdown = () => {
    if (!note) return;
    const checklistBody = items
      .map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`)
      .join("\n");
    const codeBody = codeBlocks
      .map((block) => `\n\n\`\`\`${block.language}\n${block.code}\n\`\`\``)
      .join("");
    const body = type === "checklist" ? checklistBody : content;
    const markdown = `# ${title || "Untitled Note"}\n\n${body}${codeBody}`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(title || "note").replace(/\s+/g, "-").toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!note) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="glass-panel rounded-xl w-full max-w-lg p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Edit note"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setType("note")}
                className={`p-2 rounded-full transition-colors ${type === "note" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                aria-label="Text note"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => setType("checklist")}
                className={`p-2 rounded-full transition-colors ${type === "checklist" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                aria-label="Checklist"
              >
                <ListChecks className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-foreground font-bold text-xl placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/60">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              {NOTE_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  className={`w-4 h-4 rounded-full border ${color === swatch ? "ring-2 ring-ring" : "border-border"}`}
                  style={{ backgroundColor: swatch }}
                  aria-label="Set note color"
                />
              ))}
            </div>
            <button
              onClick={exportAsMarkdown}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export .md
            </button>
            {type === "checklist" && items.some((item) => item.checked) && (
              <button
                onClick={clearCompletedItems}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear completed
              </button>
            )}
          </div>

          {type === "note" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              rows={6}
              className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div className="space-y-2">
              <ChecklistEditor items={items} onChange={setItems} />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="Add item..."
                  className="flex-1 bg-muted text-foreground text-sm rounded-md px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Image Attachments */}
          <div>
            <ImageAttachments images={images} onChange={setImages} />
          </div>

          {/* Code Blocks */}
          <div className="space-y-2">
            {codeBlocks.map((block) => (
              <div key={block.id} className="relative group">
                <CodeBlockDisplay block={block} />
                <button
                  onClick={() => removeCodeBlock(block.id)}
                  className="absolute top-1 right-8 p-1 rounded text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label="Remove code block"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {showCodeInput ? (
              <div className="space-y-2 p-3 rounded-lg border border-border bg-background/40">
                <div className="flex items-center gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="note-language-select border border-border/50 bg-background text-foreground text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label="Programming language"
                  >
                    {[
                      "javascript",
                      "typescript",
                      "python",
                      "html",
                      "css",
                      "json",
                      "sql",
                      "bash",
                      "other",
                    ].map((l) => (
                      <option
                        key={l}
                        value={l}
                        className="bg-popover text-popover-foreground"
                      >
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCodeInput(false)}
                    className="ml-auto p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={5}
                  className="w-full bg-muted text-foreground font-mono text-xs rounded-md px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
                <button
                  onClick={addCodeBlock}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  Add Code Block
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCodeInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                Add code block
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className="bg-muted text-foreground text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              onClick={() => {
                setPendingDeleteAction("note");
                setConfirmOpen(true);
              }}
              className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={save}
              className="ml-auto px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </motion.div>

        <DeleteConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={
            pendingDeleteAction === "note"
              ? "Move note to trash?"
              : "Delete code block?"
          }
          description={
            pendingDeleteAction === "note"
              ? "You can restore this note later from the Trash view."
              : "This code block will be removed from the note."
          }
          confirmLabel={
            pendingDeleteAction === "note" ? "Move to Trash" : "Delete Block"
          }
          onConfirm={() => {
            if (!note) return;
            if (pendingDeleteAction === "note") {
              onTrash(note.id);
              onClose();
            } else if (pendingCodeBlockId) {
              setCodeBlocks((prev) =>
                prev.filter((b) => b.id !== pendingCodeBlockId),
              );
              setPendingCodeBlockId(null);
            }
            setConfirmOpen(false);
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;
