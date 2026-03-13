import { ChecklistItem } from "@/types/note";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readonly?: boolean;
}

const ChecklistEditor = ({
  items,
  onChange,
  readonly = false,
}: ChecklistEditorProps) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const toggle = (id: string) => {
    onChange(
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  };

  const updateText = (id: string, text: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const pendingItem = items.find((item) => item.id === pendingDeleteId);

  return (
    <div className="space-y-1" role="list" aria-label="Checklist items">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 group"
          role="listitem"
        >
          <button
            onClick={() => toggle(item.id)}
            className={cn(
              "w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all duration-150",
              item.checked
                ? "bg-primary border-primary"
                : "border-muted-foreground/40 hover:border-primary",
            )}
            aria-label={`${item.checked ? "Uncheck" : "Check"} ${item.text}`}
            disabled={readonly}
          >
            {item.checked && (
              <Check className="w-3 h-3 text-primary-foreground" />
            )}
          </button>
          {readonly ? (
            <span
              className={cn(
                "text-sm leading-relaxed",
                item.checked
                  ? "text-muted-foreground line-through"
                  : "text-foreground",
              )}
            >
              {item.text}
            </span>
          ) : (
            <>
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateText(item.id, e.target.value)}
                className={cn(
                  "flex-1 bg-transparent text-sm focus:outline-none",
                  item.checked
                    ? "text-muted-foreground line-through"
                    : "text-foreground",
                )}
              />
              <button
                type="button"
                onClick={() => setPendingDeleteId(item.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                aria-label={`Delete ${item.text}`}
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ))}

      <DeleteConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title="Delete task item?"
        description={
          pendingItem
            ? `"${pendingItem.text}" will be removed from this checklist.`
            : "This task item will be removed from this checklist."
        }
        confirmLabel="Delete Item"
        onConfirm={() => {
          if (pendingDeleteId) {
            removeItem(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
};

export default ChecklistEditor;
